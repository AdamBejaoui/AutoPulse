import { scrapeFacebookMarketplaceLocation } from './lib/scrapers/facebook';
import { prisma } from './lib/prisma';

async function test() {
  console.log("Triggering DETAILED test scrape for Jeep in Phoenix...");
  // Limiting to a few items for quick verification
  const result = await scrapeFacebookMarketplaceLocation("Phoenix", { keywords: "Jeep", maxPrice: 15000 });
  console.log("Scrape result:", result);
  
  const latest = await prisma.listing.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5
  });
  
  console.log("\nResults Verification:");
  latest.forEach(l => {
    console.log(`[${l.year} ${l.make} ${l.model}]`);
    console.log(`- Description present: ${l.description ? 'YES (' + l.description.length + ' chars)' : 'NO'}`);
    console.log(`- Published date present: ${l.postedAt ? l.postedAt.toISOString() : 'NO'}`);
    console.log('---');
  });
  
  process.exit(0);
}

test().catch(console.error);
