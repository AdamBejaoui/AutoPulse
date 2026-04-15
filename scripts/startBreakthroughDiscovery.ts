import { MARKETPLACE_CITIES } from "../lib/cities";
import { scrapeLocalMarketplace } from "../lib/scrapers/localFacebook";
import * as fs from "fs";
import * as path from "path";

// Simple built-in .env parser 
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        process.env[key.trim()] = value;
      }
    });
  }
}

loadEnv();

const PRICE_BANDS = [
  { minPrice: 500, maxPrice: 5000 },
  { minPrice: 5001, maxPrice: 15000 },
  { minPrice: 15001, maxPrice: 30000 },
  { minPrice: 30001, maxPrice: 60000 },
  { minPrice: 60001, maxPrice: 150000 },
];

async function startNationwideBreakthrough() {
  console.log("🚀 STARTING NATIONWIDE NATIVE CRAWL (52 Cities, All United States)...");
  
  // We will iterate through ALL cities in lib/cities.ts
  for (const city of MARKETPLACE_CITIES) {
    console.log(`\n🌎 [US-CORE] Traveling to ${city.label}...`);
    
    for (const band of PRICE_BANDS) {
      console.log(`💰 Slicing range: $${band.minPrice} - $${band.maxPrice}`);
      
      try {
        const result = await scrapeLocalMarketplace(city.slug, band);
        console.log(`✅ [${city.slug}] Found: ${result.scraped}, New Listings Saved: ${result.upserted}`);
      } catch (error) {
        console.error(`❌ Error in band $${band.minPrice}-$${band.maxPrice} for ${city.slug}:`, error);
      }
      
      // Local scraping is faster, so we only need small delays
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  console.log("\n🎊 NATIONWIDE DISCOVERY COMPLETE.");
}

startNationwideBreakthrough().catch(console.error);
