require('dotenv').config();
const { ApifyClient } = require('apify-client');

async function getRawData() {
  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
  
  console.log("Fetching last run...");
  const runs = await client.actor("curious_coder/facebook-marketplace").runs().list({ limit: 1 });
  
  if (runs.items.length === 0) {
    console.log("No runs found for this actor.");
    return;
  }
  
  console.log(`Fetching items from dataset ${runs.items[0].defaultDatasetId}...`);
  const dataset = await client.dataset(runs.items[0].defaultDatasetId).listItems({ limit: 1 });
  
  if (dataset.items.length === 0) {
    console.log("No items found in dataset.");
    return;
  }
  
  console.log("RAW ITEM SCHEMA:");
  console.log(JSON.stringify(dataset.items[0], null, 2));
}

getRawData().catch(console.error);
