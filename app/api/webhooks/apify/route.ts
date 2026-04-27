import { NextResponse } from 'next/server';
import { parseListingText, isJunkTitle } from '@/lib/parser/listingParser';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: "Apify Webhook Endpoint Active" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resource } = body;
    const datasetId = resource?.defaultDatasetId;

    if (!datasetId) return NextResponse.json({ error: "No datasetId" }, { status: 400 });

    const apiToken = process.env.APIFY_API_TOKEN;
    const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiToken}`);
    if (!response.ok) return NextResponse.json({ error: "Fetch failed" }, { status: 500 });

    const items = await response.json();
    const { prisma } = await import("@/lib/db");
    const { matchListingToSubscriptions } = await import("@/lib/alertMatcher");

    let count = 0;
    for (const item of items) {
      try {
        const description = item.description || item.redacted_description?.text || '';
        const title = item.marketplace_listing_title || item.custom_title || item.title || '';
        
        // 1. Junk Filter
        if (isJunkTitle(title, description)) {
          console.log(`[webhook] Skipping junk title: ${title}`);
          continue;
        }

        const parsed = parseListingText(title, description);
        if (parsed.isJunk) {
          console.log(`[webhook] Skipping confirmed junk listing (parsed): ${title}`);
          continue;
        }

        // 2. ID and URL construction
        const externalId = (item.id || item.listingUrl?.match(/item\/(\d+)/)?.[1] || item.url?.match(/item\/(\d+)/)?.[1] || Math.random().toString()).toString();
        const listingUrl = externalId.match(/^\d+$/) 
          ? `https://www.facebook.com/marketplace/item/${externalId}/`
          : item.listingUrl || item.url || '';

        // 3. Price construction (Cents)
        const priceCents = item.listing_price?.amount 
          ? Math.round(parseFloat(item.listing_price.amount) * 100) 
          : (item.price ? Math.round(parseFloat(item.price) * 100) : 0);

        // 4. Image collection
        const imageUrls = [
          item.primary_listing_photo_url,
          ...(item.listing_photos?.map((p: any) => p.image?.uri || p.url) || []),
          ...(item.all_listing_photos?.map((p: any) => p.image?.uri) || []),
          ...(item.additional_photos?.map((p: any) => p.uri) || [])
        ].filter(Boolean);

        // 5. Merge Parser Results with Scraper Metadata
        let milesText = item.custom_sub_titles_with_rendering_flags?.find((s: any) => s.subtitle?.toLowerCase().includes('miles'))?.subtitle;
        let milesInt = milesText ? parseInt(milesText.replace(/[^\d]/g, '')) : null;
        if (milesText && milesText.toLowerCase().includes('k') && milesInt && milesInt < 1000) {
            milesInt = milesInt * 1000;
        }

        const listingData = {
          externalId: externalId,
          source: 'facebook',
          rawTitle: title,
          description: description,
          listingUrl: listingUrl,
          price: priceCents,
          imageUrls: Array.from(new Set(imageUrls)),
          city: item.location_text?.text?.split(',')[0]?.trim() || item.city || item.location?.reverse_geocode?.city || null,
          state: item.location_text?.text?.split(',')[1]?.trim() || item.state || item.location?.reverse_geocode?.state || null,
          postedAt: item.creation_time ? new Date(item.creation_time * 1000) : null,
          
          // Use parser for core attributes
          make: parsed.make,
          model: parsed.model,
          year: parsed.year,
          mileage: parsed.mileage || milesInt || item.vehicle_odometer_data?.value || null,
          trim: parsed.trim || item.vehicle_trim_display_name || null,
          bodyStyle: parsed.bodyStyle,
          driveType: parsed.driveType,
          engine: parsed.engine,
          transmission: parsed.transmission || item.vehicle_transmission_type || null,
          fuelType: parsed.fuelType,
          color: parsed.color || item.vehicle_exterior_color || item.vehicle_interior_color || null,
          doors: parsed.doors,
          titleStatus: parsed.titleStatus || item.vehicle_title_status || null,
          condition: parsed.condition,
          accidents: parsed.accidents,
          owners: parsed.owners,
          features: parsed.features,
          vin: parsed.vin || item.vehicle_identification_number || null,
          isJunk: parsed.isJunk,
          isCar: !parsed.isJunk && parsed.make !== "Unknown",
          parseScore: parsed.parseScore,
          parsedAt: new Date(),
        };

        const listing = await prisma.listing.upsert({
          where: { externalId: listingData.externalId },
          update: listingData,
          create: listingData,
        });

        if (listing) {
          count++;
          // Trigger email match on successful enrichment
          try {
            await matchListingToSubscriptions(listing);
          } catch (matchError) {
            console.error(`[webhook] Failed to match subscriptions:`, matchError);
          }
        }
      } catch (err) {
        console.error(`[webhook] Item error:`, err);
      }
    }

    return NextResponse.json({ success: true, processed: count });
  } catch (error: any) {
    console.error(`[webhook] Critical error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

