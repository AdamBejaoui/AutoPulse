import { ApifyClient } from "apify-client";
import { prisma } from "../prisma";
import { parseListingText, isJunkTitle } from "../parser/listingParser";
import { getAlertMatchQueue } from "../queue";

export type ScrapeLocationResult = {
  location: string;
  scraped: number;
  upserted: number;
  errors: number;
  hardLimited?: boolean;
};

export type MarketplaceScrapeFilters = {
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
};

function buildVehiclesUrl(
  location: string,
  filters: MarketplaceScrapeFilters,
): string {
  const base = `https://www.facebook.com/marketplace/${encodeURIComponent(location)}/vehicles`;
  const params = new URLSearchParams();
  params.set("sortBy", "creation_time_descend");
  params.set("exact", "false");
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minMileage != null) {
    params.set("minMileage", String(filters.minMileage));
  }
  if (filters.maxMileage != null) {
    params.set("maxMileage", String(filters.maxMileage));
  }
  return `${base}?${params.toString()}`;
}

function parsePriceToCents(raw: string | number | null | undefined): number {
  if (raw == null) return 0;
  if (typeof raw === "number") return Math.round(raw * 100);

  const match = raw.toString().match(/\$?([0-9,.]+)/);
  if (!match?.[1]) return 0;

  const cleaned = match[1].replace(/,/g, "");
  const dollars = parseFloat(cleaned);
  if (Number.isNaN(dollars)) return 0;

  const cents = Math.round(dollars * 100);
  const MAX_CENTS = 2000000000;
  return cents > MAX_CENTS ? MAX_CENTS : cents;
}

function parseRawMoneyToken(rawToken: string, hasK: boolean): number {
  const raw = rawToken.replace(/\s/g, "");
  let dollars = 0;
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(raw)) {
    dollars = Number(raw.replace(/[.,]/g, ""));
  } else {
    dollars = Number(raw.replace(/,/g, ""));
  }
  if (!Number.isFinite(dollars) || dollars <= 0) return 0;
  if (hasK) dollars *= 1000;
  return dollars;
}

function parsePriceFromTextToCents(text: string): number {
  const candidates: number[] = [];

  const dollarRegex = /\$\s*(\d[\d.,\s]*)(?:\s*([kK]))?/g;
  for (const m of text.matchAll(dollarRegex)) {
    const dollars = parseRawMoneyToken(m[1] || "", Boolean(m[2]));
    if (dollars >= 500 && dollars <= 300000) candidates.push(dollars);
  }

  const contextRegex =
    /\b(?:price|asking|obo|firm|usd)\b\s*[:\-]?\s*(\d[\d.,\s]*)(?:\s*([kK]))?/gi;
  for (const m of text.matchAll(contextRegex)) {
    const dollars = parseRawMoneyToken(m[1] || "", Boolean(m[2]));
    if (dollars >= 500 && dollars <= 300000) candidates.push(dollars);
  }

  if (candidates.length === 0) return 0;
  return Math.round(candidates[0]! * 100);
}

function parseCityState(raw: any, locationSlug?: string): {
  city: string | null;
  state: string | null;
} {
  if (!raw) {
    if (locationSlug) {
       // Fallback to slug-based guessing if raw location is missing
       const parts = locationSlug.split("-");
       const city = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
       return { city, state: null };
    }
    return { city: null, state: null };
  }
  
  let str = "";
  if (typeof raw === "object") {
    str = raw.name || raw.city || raw.address || raw.locationName || JSON.stringify(raw);
  } else {
    str = String(raw);
  }

  if (str.includes("{") || !str.includes(",")) {
    return { city: str.substring(0, 50), state: null };
  }
  
  const parts = str.split(",").map((p) => p.trim());
  let city = parts[0] ?? null;
  let state = parts[1] ?? null;

  // Standardization: If we have a state like "Texas" or "TX", keep it clean.
  // If state is missing but we know the slug, we could potentially inject it,
  // but for now, we'll let the resilient filter handle the state:null cases.
  
  return { city, state };
}


export async function scrapeFacebookMarketplaceLocation(
  location: string,
  filters: MarketplaceScrapeFilters = {},
  options: { includeDetails?: boolean } = { includeDetails: true }
): Promise<ScrapeLocationResult> {
  const result: ScrapeLocationResult = {
    location,
    scraped: 0,
    upserted: 0,
    errors: 0,
  };

  const API_TOKEN = process.env.APIFY_API_TOKEN;
  if (!API_TOKEN) {
    console.warn("[facebook] APIFY_API_TOKEN is missing, signaling fallback to local scraper...");
    result.hardLimited = true;
    return result;
  }

  const client = new ApifyClient({ token: API_TOKEN });
  const startUrl = buildVehiclesUrl(location, filters);

  try {
    const isDetailed = options.includeDetails !== false;
    const maxItems = isDetailed
      ? Number(process.env.FB_MAX_ITEMS_DETAILED ?? 1200)
      : Number(process.env.FB_MAX_ITEMS_BASIC ?? 4000);
    console.log(
      `[facebook] Starting scrape for "${location}" (detailed=${isDetailed}, maxItems=${maxItems})...`,
    );
    
    // Reverting to official actor but with RESIDENTIAL proxies to bypass blocks
    const run = await client.actor("apify/facebook-marketplace-scraper").call({
      startUrls: [{ url: startUrl }],
      maxItems,
      includeListingDetails: isDetailed,
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
      },
      useStealth: true,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    result.scraped = items.length;

    console.log(`[facebook] Apify returned ${items.length} items for "${location}".`);

    for (const item of items as any[]) {
      try {
        const title = (item.title || item.name || item.listingName || "Listing").toString();
        const externalId = (item.id || item.postId || item.id_listing || item.listingId || "").toString();
        if (!externalId) continue;

        const url = (item.url || item.listing_url || item.itemUrl || `https://www.facebook.com/marketplace/item/${externalId}`).toString();
        const imgUrl = (item.primaryImage || item.image || item.thumbnail || item.listing_image || null)?.toString();
        
        // JUNK GUARD: Filter placeholders like "Marketplace Listing" or category nav nodes
        if (isJunkTitle(title)) {
          console.log(`[facebook] ⏭️ Skipping junk listing: "${title}"`);
          continue;
        }

        // Price detection (handles number or formatted string)
        let price = parsePriceToCents(item.price || item.priceFormatted || item.price_formatted || item.price_raw);
        if (price === 0 && typeof item.price === 'number' && item.price > 0 && item.price < 2000000) {
          price = Math.round(item.price * 100);
        }

        const { city, state } = parseCityState(
          item.location || item.city || item.locationName || item.address,
          location
        );

        
        // PARSING PRIORITY:
        // 1. Actor's native vehicle_information
        // 2. Regex from title
        const vInfo: any = item.vehicle_information || item.vehicle || {};
        const parsedFromTitle = parseListingText(title, (item.description || item.listingDescription || "").toString());
        if (price === 0) {
          price = parsePriceFromTextToCents(title);
        }
        
        const make = vInfo.make || parsedFromTitle.make || "Unknown";
        const model = vInfo.model || parsedFromTitle.model || "Unknown";
        const year = Number(vInfo.year) || parsedFromTitle.year || 0;
        const mileage = item.mileage ? parseInt(item.mileage.toString().replace(/\D/g, '')) : (Number(vInfo.mileage) || parsedFromTitle.mileage);

        // QUALITY GUARD: Skip if make is Unknown - prevents "Marketplace Listing" spam
        if (make === "Unknown") {
          console.log(`[facebook] ⏭️ Unparseable make, skipping: "${title}"`);
          continue;
        }

        // SEMANTIC DEDUPLICATION: Skip if a listing with identical specs already exists
        const duplicate = await prisma.listing.findFirst({
          where: {
            make,
            model,
            year,
            price,
            mileage,
            city,
          },
          select: { externalId: true }
        });

        if (duplicate && duplicate.externalId !== externalId) {
          console.log(`[facebook] ⏭️ Semantic duplicate found (different ID), skipping: "${title}" ($${price/100})`);
          continue;
        }

        // Safely extract description text
        const rawDesc: any = item.description || item.listingDescription || null;
        let description = typeof rawDesc === "object" && rawDesc !== null
          ? (rawDesc.text || rawDesc.name || JSON.stringify(rawDesc)).substring(0, 2000)
          : rawDesc?.toString().substring(0, 2000);
        if (!description || description.trim().length === 0) {
          description = `AutoPulse capture: ${title}`.substring(0, 2000);
        }
          
        const rawTime = item.creationTime || item.creation_time || item.time || item.timestamp || null;
        let postedAt: Date | null = null;
        if (rawTime) {
          const timeNum = Number(rawTime);
          if (!isNaN(timeNum)) {
            // Conversion safely handles unix timestamps (10 digits = seconds)
            postedAt = new Date(timeNum < 10000000000 ? timeNum * 1000 : timeNum);
          } else {
          postedAt = new Date(String(rawTime));
          }
        }

        await prisma.listing.upsert({
          where: { externalId },
          update: {
            make,
            model,
            year,
            price,
            mileage,
            city,
            state,
            imageUrl: imgUrl,
            listingUrl: url,
            description,
            trim: parsedFromTitle.trim,
            bodyStyle: parsedFromTitle.bodyStyle,
            driveType: parsedFromTitle.driveType,
            transmission: parsedFromTitle.transmission,
            fuelType: parsedFromTitle.fuelType,
            color: parsedFromTitle.color,
            titleStatus: parsedFromTitle.titleStatus,
            condition: parsedFromTitle.condition,
            owners: parsedFromTitle.owners,
            accidents: parsedFromTitle.accidents,
            features: parsedFromTitle.features,
            rawTitle: title,
            rawDescription: description,
            parseScore: parsedFromTitle.parseScore,
            parsedAt: new Date(),
            postedAt,
            sellerName: (item.seller?.name || item.sellerName || null)?.toString(),
            updatedAt: new Date(),
          },
          create: {
            externalId,
            source: "facebook",
            make,
            model,
            year,
            price,
            mileage,
            city,
            state,
            imageUrl: imgUrl,
            listingUrl: url,
            description,
            trim: parsedFromTitle.trim,
            bodyStyle: parsedFromTitle.bodyStyle,
            driveType: parsedFromTitle.driveType,
            engine: parsedFromTitle.engine,
            transmission: parsedFromTitle.transmission,
            fuelType: parsedFromTitle.fuelType,
            color: parsedFromTitle.color,
            doors: parsedFromTitle.doors,
            titleStatus: parsedFromTitle.titleStatus,
            condition: parsedFromTitle.condition,
            owners: parsedFromTitle.owners,
            accidents: parsedFromTitle.accidents,
            features: parsedFromTitle.features,
            rawTitle: title,
            rawDescription: description,
            parseScore: parsedFromTitle.parseScore,
            parsedAt: new Date(),
            sellerName: (item.seller?.name || item.sellerName || null)?.toString(),
            postedAt,
          },
        });

        // Trigger reactive alert matching
        try {
          const alertQueue = getAlertMatchQueue();
          await alertQueue.add("matchListing", { listingId: externalId }, {
            removeOnComplete: true,
            jobId: `match-${externalId}` // Deduplicate jobs for the same listing ID
          });
        } catch (queueErr) {
          console.error(`[facebook] Failed to queue alert match for ${externalId}:`, queueErr);
        }

        result.upserted += 1;
      } catch (e) {
        result.errors += 1;
        console.error(`[facebook] Upsert failed for id ${item.id}:`, e);
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[facebook] Apify scraper failed for location "${location}": ${msg}`);
    if (/hard limit exceeded/i.test(msg)) {
      result.hardLimited = true;
    }
    result.errors += 1;
  }

  return result;
}
