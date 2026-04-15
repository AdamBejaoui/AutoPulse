const { ApifyClient } = require('apify-client');
require('dotenv').config();

async function checkDetailedSchema() {
  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
  console.log("Fetching last run of apify/facebook-marketplace-scraper...");
  
  const runs = await client.actor("apify/facebook-marketplace-scraper").runs().list({ limit: 1 });
  if (!runs.items.length) return console.log("No runs found.");
  
  const dataset = await client.dataset(runs.items[0].defaultDatasetId).listItems({ limit: 2 });
  if (!dataset.items.length) return console.log("No items found.");
  
  console.log("DETAILED ITEM SAMPLE:");
  const it = dataset.items[0];
  console.log(JSON.stringify({
    title: it.title,
    description: it.description,
    listingDescription: it.listingDescription,
    creationTime: it.creationTime,
    time: it.time,
    id: it.id,
    price: it.price
  }, null, 2));
}

checkDetailedSchema().catch(console.error);
