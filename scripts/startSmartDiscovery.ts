import { scrapeFacebookMarketplaceLocation } from "../lib/scrapers/facebook";
import { MARKETPLACE_CITIES } from "../lib/cities";

async function smartDiscovery() {
  console.log("🚀 Starting Smart Discovery Cycle...");
  
  // High volume cities to prioritize
  const targets = [
    "new-york-city",
    "los-angeles",
    "chicago",
    "houston",
    "phoenix",
    "miami",
    "dallas",
    "atlanta"
  ];

  for (const city of targets) {
    console.log(`\n🌊 [wave] Initiating discovery for ${city.toUpperCase()}...`);
    try {
      const result = await scrapeFacebookMarketplaceLocation(city, { 
        keywords: "car", // Broad search for volume
        maxPrice: 100000 
      }, { includeDetails: true });
      
      console.log(`✅ [wave] Finished ${city}: Scraped ${result.scraped}, Upserted ${result.upserted}`);
      
      // Safety delay between cities to avoid Apify memory/concurrency spikes
      console.log("Subsided. Waiting 2 minutes for next wave...");
      await new Promise(r => setTimeout(r, 120000));
      
    } catch (e) {
      console.error(`❌ [wave] ${city} failed:`, e);
    }
  }

  console.log("\n🏁 Smart Discovery Cycle Complete!");
  process.exit(0);
}

smartDiscovery().catch(console.error);
