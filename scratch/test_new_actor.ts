import { ApifyClient } from "apify-client";

async function testNewActor() {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  if (!API_TOKEN) return console.error("Missing API token");
  
  const client = new ApifyClient({ token: API_TOKEN });
  
  console.log("Testing curious_coder/facebook-marketplace actor...");
  
  try {
    const run = await client.actor("curious_coder/facebook-marketplace").call({
      "urls": [
        "https://www.facebook.com/marketplace/houston/search/?query=toyota"
      ],
      "getListingDetails": true,
      "maxPagesPerUrl": 1,
      "proxy": {
        "useApifyProxy": true,
        "apifyProxyCountry": "US"
      }
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 2 });
    console.log("Sample Output Item:", JSON.stringify(items[0], null, 2));
  } catch (e) {
    console.error("Actor failed:", e);
  }
}

testNewActor().catch(console.error);
