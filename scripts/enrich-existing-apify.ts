import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 20; // Number of URLs to send to Apify per run

const targetMakes = ['Toyota', 'Honda', 'Mazda', 'Lexus'];
const targetStates = [
  'PA', 'VA', 'NC', 'SC', 'GA', 'FL', 'WV', 'WVA', 'TN', 'AL', 
  'OH', 'IN', 'KY', 'MI', 'LA', 'AR', 'MO', 'IA', 'MN', 'TX', 
  'OK', 'KS', 'NM', 'CO', 'WY', 'NE', 'SD', 'ND', 'UT'
];

export async function enrichExisting() {
  console.log('═══════════════════════════════════════');
  console.log('   AUTOPULSE APIFY ENRICHMENT SCRIPT');
  console.log('═══════════════════════════════════════');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE — No Apify run will be started.\n');
  }

  // 1. Query matching listings
  let listings: any[] = [];
  let attempts = 0;
  while (attempts < 3) {
    try {
      listings = await prisma.listing.findMany({
        where: {
          make: { in: targetMakes, mode: 'insensitive' },
          year: { gte: 2009 },
          OR: [
            { mileage: { gte: 200000 } },
            { mileage: null }
          ],
          state: { in: targetStates, mode: 'insensitive' },
          isJunk: false
        },
        select: {
          id: true,
          externalId: true,
          listingUrl: true,
          make: true,
          model: true,
          year: true,
          mileage: true,
          state: true
        },
        orderBy: { createdAt: 'desc' }
      });
      break; // Success
    } catch (e: any) {
      attempts++;
      console.log(`⚠️ Database connection attempt ${attempts} failed. Retrying in 5s...`);
      if (attempts >= 3) throw e;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log(`📊 Found ${listings.length} listings matching criteria.`);

  if (listings.length === 0) {
    console.log('✨ No listings need enrichment.');
    await prisma.$disconnect();
    return;
  }

  // 2. Filter out listings that don't have a valid URL
  const validListings = listings.filter(l => l.listingUrl && l.listingUrl !== 'none' && l.listingUrl.trim() !== '');
  console.log(`🎯 Valid URLs available: ${validListings.length}`);

  // 3. Take a batch
  const batch = validListings.slice(0, BATCH_SIZE);
  console.log(`📦 Selected batch of ${batch.length} listings for this run.`);

  if (DRY_RUN) {
    console.log('\n📋 Listings in this batch:');
    batch.forEach((l, i) => {
      console.log(`   ${i + 1}. [${l.state}] ${l.year} ${l.make} ${l.model} (${l.mileage ?? 'Unknown'} mi) - ${l.listingUrl}`);
    });
    console.log('\n💡 To run for real, remove the --dry-run flag.');
    await prisma.$disconnect();
    return;
  }

  // 4. Build Apify input
  const input = {
    urls: batch.map(l => l.listingUrl),
    maxPagesPerUrl: 1,
    maxItems: BATCH_SIZE,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
      apifyProxyCountry: 'US'
    },
    onlyPublic: false,
    useFilters: true,
    scrapeDetails: true // CRITICAL: Get full details
  };

  // 5. Start Apify run
  try {
    console.log('\n📡 Starting Apify run for batch...');
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/apify`;
    console.log(`🔗 Webhook URL: ${webhookUrl}`);

    const run = await apifyClient.actor('curious_coder/facebook-marketplace').start(input, {
      webhooks: [{
        eventTypes: ['ACTOR.RUN.SUCCEEDED'],
        requestUrl: webhookUrl,
      }]
    });

    console.log(`\n✅ ENRICHMENT RUN STARTED!`);
    console.log(`🔗 Run ID : ${run.id}`);
    console.log(`📊 View   : https://console.apify.com/actors/runs/${run.id}`);
  } catch (error: any) {
    console.error('❌ Failed to start Apify run:', error.message);
  }

  await prisma.$disconnect();
}

enrichExisting().catch(console.error);
