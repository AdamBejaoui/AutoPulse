import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { ApifyClient } from 'apify-client';

import { PrismaClient } from '@prisma/client';
const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

async function runMegaHarvest() {
  const prisma = new PrismaClient();
  console.log('🚀 INITIALIZING SMART PRIORITY HARVEST...');

  // 1. Fetch search criteria from active subscriptions to prioritize
  const subs = await prisma.subscription.findMany({
    select: { make: true, model: true, city: true },
    where: {
        OR: [
            { make: { not: null } },
            { model: { not: null } }
        ]
    }
  });

  // Deduplicate combinations
  const combos = Array.from(new Set(subs.map(s => `${s.make || ''} ${s.model || ''}`.trim()))).filter(Boolean);
  console.log(`🎯 Found ${combos.length} unique subscription pairs to prioritize.`);

  // 2. High-probability cities (Short Slugs)
  const priorityCities = ['nyc', 'la', 'chicago', 'houston', 'miami', 'atlanta', 'dallas', 'philly'];
  const generalCities = ['denver', 'seattle', 'boston', 'austin', 'phoenix'];

  const startUrls: any[] = [];

  // 3. ADAPTING TO PRIORITIES: Search specifically for what people WANT in major cities
  // These go FIRST in the queue.
  for (const combo of combos) {
      for (const city of priorityCities.slice(0, 3)) { // Top 3 cities for every specific sub to keep costs low
          startUrls.push({ 
              url: `https://www.facebook.com/marketplace/${city}/search?query=${encodeURIComponent(combo)}&category_id=vehicles&sort=CREATION_TIME_DESCEND` 
          });
      }
  }

  // 4. GENERAL HARVEST: Catch everything else in other cities
  for (const city of [...priorityCities, ...generalCities]) {
      startUrls.push({ 
          url: `https://www.facebook.com/marketplace/${city}/vehicles?sort=CREATION_TIME_DESCEND` 
      });
  }

  console.log(`📍 Generated ${startUrls.length} total target URLs (${combos.length * 3} prioritized search URLs).`);

  // 5. Build Input for OFFICIAL Apify Scraper (apify/facebook-marketplace-scraper)
  const rawCookies = process.env.FB_COOKIES || process.env.FB_SESSION_COOKIES || '';
  const cleanedCookies = rawCookies.replace(/\s/g, '').replace(/\\/g, ''); 
  
  let cookies: any[] = [];
  try {
    if (cleanedCookies) {
        cookies = JSON.parse(cleanedCookies);
    }
  } catch (e) {
    console.warn('⚠️ Could not parse FB_COOKIES JSON.');
  }

  const input = {
    "startUrls": startUrls.slice(0, 50), // Limit to top 50 starts per run to save money
    "maxResultsPerQuery": 40,           
    "resultsLimit": 500,                
    "proxyConfiguration": {
      "useApifyProxy": true,
      "apifyProxyGroups": ["RESIDENTIAL"]    
    },
    "cookies": cookies,
    "viewPortWidth": 1280,
    "viewPortHeight": 720
  };

  console.log('📡 Triggering OFFICIAL actor (apify/facebook-marketplace-scraper)...');

  try {
    const run = await client.actor('apify/facebook-marketplace-scraper').start(input, {
        webhooks: [
            {
                eventTypes: ['ACTOR.RUN.SUCCEEDED'],
                requestUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/apify`,
            }
        ]
    });

    console.log(`✅ PRIORITY HARVEST COMMENCED!`);
    console.log(`🔗 Run ID: ${run.id}`);
    console.log(`📊 View: https://console.apify.com/actors/runs/${run.id}`);
    
    // Save cookies back if they rotate? (Scraper usually handles this via session)
  } catch (error: any) {
    console.error('❌ Failed to start Priority Harvest:', error.message);
  } finally {
      await prisma.$disconnect();
  }
}

runMegaHarvest().catch(console.error);
