import { chromium } from "playwright";
import { scrapeFacebookMarketplaceLocation } from "../lib/scrapers/facebook";

async function main() {
  console.log("Testing FB Scraper...");
  const result = await scrapeFacebookMarketplaceLocation("boston", { maxPrice: 5000 });
  console.log(result);
}

main().catch(console.error);
