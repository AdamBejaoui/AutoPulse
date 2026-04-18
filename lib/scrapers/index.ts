import { scrapeFacebookMarketplaceLocation } from "./facebook";
import { scrapeLocalMarketplace } from "./localFacebook";

import { MARKETPLACE_CITIES } from "../cities";
import { prisma } from "../prisma";

const DEFAULT_LOCATIONS = MARKETPLACE_CITIES.map((c) => c.slug);

function getLocationsFromEnv(): string[] {
  const raw = process.env.FB_LOCATIONS;
  if (!raw || raw.trim() === "") {
    return [...DEFAULT_LOCATIONS];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type RunAllScrapersSummary = {
  totalScraped: number;
  totalUpserted: number;
  totalErrors: number;
};

export async function runAllScrapers(): Promise<RunAllScrapersSummary> {
  const envLocations = getLocationsFromEnv();
  
  // Phase 3: Dynamic Priority Escalation
  // Find cities where users actually have active alerts
  const activeSubs = await prisma.subscription.findMany({
    select: { city: true },
    where: { city: { not: null } }
  });
  
  const activeCities = Array.from(new Set(activeSubs.map(s => s.city!.toLowerCase().replace(/\s+/g, '-'))));
  
  // Re-order locations: Active subscription cities first, then the rest
  const priorityLocations = envLocations.filter(loc => activeCities.includes(loc));
  const otherLocations = envLocations.filter(loc => !activeCities.includes(loc));
  
  const locations = [...priorityLocations, ...otherLocations];
  
  console.log(`[scraper] Prioritizing ${priorityLocations.length} active cities: ${priorityLocations.join(", ")}`);

  const summary: RunAllScrapersSummary = {
    totalScraped: 0,
    totalUpserted: 0,
    totalErrors: 0,
  };

  const CONCURRENCY = Math.max(1, Number(process.env.FB_LOCATION_CONCURRENCY ?? 4));
  for (let i = 0; i < locations.length; i += CONCURRENCY) {
    const batch = locations.slice(i, i + CONCURRENCY);
    console.log(`[scraper] Starting batch: ${batch.join(", ")}`);

    const results = await Promise.allSettled(
      batch.map((location) =>
        scrapeFacebookMarketplaceLocation(location, {}, { includeDetails: true }),
      ),
    );

    const fallbackLocations: string[] = [];
    for (let idx = 0; idx < results.length; idx += 1) {
      const r = results[idx]!;
      const location = batch[idx]!;
      if (r.status === "fulfilled") {
        const val = r.value;
        const shouldFallback = val.hardLimited || (val.scraped === 0 && val.errors > 0);
        
        if (shouldFallback) {
          console.warn(
            `[scraper] ${location}: Scrape result empty or limited (scraped=${val.scraped}, errors=${val.errors}), falling back to local scrape`,
          );
          fallbackLocations.push(location);
        }
        console.log(
          `[scraper] ${location}: scraped=${val.scraped} upserted=${val.upserted} errors=${val.errors}`,
        );
        summary.totalScraped += val.scraped;
        summary.totalUpserted += val.upserted;
        summary.totalErrors += val.errors;
      } else {
        const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
        console.error(`[scraper] Fatal error for ${location}: ${msg}`);
        summary.totalErrors += 1;
      }
    }
    
    for (const loc of fallbackLocations) {
      try {
        const fallback = await scrapeLocalMarketplace(loc);
        console.log(
          `[scraper-fallback] ${loc}: scraped=${fallback.scraped} upserted=${fallback.upserted}`,
        );
        summary.totalScraped += fallback.scraped;
        summary.totalUpserted += fallback.upserted;
      } catch (fallbackErr) {
        const isAuthError = fallbackErr instanceof Error && fallbackErr.name === "FacebookAuthError";
        
        if (isAuthError) {
          console.error("\n\n🚨🚨🚨 CRITICAL AUTHENTICATION FAILURE 🚨🚨🚨");
          console.error(`[scraper-fallback] Facebook is blocking the current IP or FB_COOKIES are EXPIRED.`);
          console.error(`[scraper-fallback] Action Required: Update FB_COOKIES environment variable with fresh session tokens.`);
          console.error("🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n\n");
          
          // Stop attempting further local scrapes in this batch if auth is definitely dead
          summary.totalErrors += fallbackLocations.length;
          break; 
        }

        const fbMsg =
          fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        console.error(`[scraper-fallback] ${loc} failed: ${fbMsg}`);
        summary.totalErrors += 1;
      }
    }
  }

  return summary;
}
