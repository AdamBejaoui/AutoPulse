
import "../lib/envBootstrap";
import { chromium } from "playwright";
import { enrichListingLocally } from "../lib/scrapers/localFacebook";

async function testSpecific() {
    const url = "https://www.facebook.com/marketplace/item/838461468566462/";
    console.log(`Verifying extraction for user's car: ${url}`);
    
    const details = await enrichListingLocally(url);
    
    if (details) {
        console.log("✅ Extraction SUCCESS!");
        console.log(`Condition: ${details.condition}`);
        console.log(`Description (Length ${details.description?.length}):`);
        console.log(details.description?.substring(0, 500) + "...");
    } else {
        console.log("❌ Extraction FAILED.");
    }
}

testSpecific().catch(console.error);
