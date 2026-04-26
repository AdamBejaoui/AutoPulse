import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import { parseListingText, isJunkTitle } from '../lib/parser/listingParser';
import { enrichListingDetails } from '../lib/scraper/enricher';
import { matchListingToSubscriptions } from '../lib/alertMatcher';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

const BATCH_SIZE = 5; // URLs per run

const targetMakes = ['Toyota', 'Honda', 'Mazda', 'Lexus'];
const targetCities = [
    'philadelphia', 'pittsburgh', // PA
    'richmond', // VA
    'charlotte', 'raleigh', // NC
    'columbia', 'charleston', // SC
    'atlanta', // GA
    'miami', 'orlando', 'tampa', // FL
    'charleston', // WVA
    'nashville', 'memphis', // TN
    'birmingham', // AL
    'columbus', 'cleveland', // OH
    'indianapolis', // IN
    'louisville', // KY
    'detroit', // MI
    'neworleans', // LA
    'littlerock', // AR
    'stlouis', 'kansascity', // MO
    'desmoines', // IA
    'minneapolis', // MN
    'houston', 'dallas', 'sanantonio', // TX
    'oklahomacity', // OK
    'wichita', // KS
    'albuquerque', // NM
    'denver', // CO
    'cheyenne', // WY
    'omaha', // NE
    'siouxfalls', // SD
    'fargo', // ND
    'saltlakecity' // UT
];

// Helper to delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runSyncCycle() {
    console.log('\n=======================================');
    console.log('🔄 STARTING SYNC & FIX CYCLE');
    console.log('=======================================');

    // 1. Build URLs
    const startUrls: { url: string }[] = [];
    
    // Add user subscriptions
    const subs = await prisma.subscription.findMany({
        select: { make: true, model: true },
        where: { OR: [{ make: { not: null } }, { model: { not: null } }] }
    });
    const combos = Array.from(new Set(subs.map(s => `${s.make || ''} ${s.model || ''}`.trim()))).filter(Boolean);

    for (const combo of combos) {
        for (const city of targetCities) {
            startUrls.push({ url: `https://www.facebook.com/marketplace/${city}/search?query=${encodeURIComponent(combo)}&category_id=vehicles&sort=CREATION_TIME_DESCEND` });
        }
    }

    for (const make of targetMakes) {
        for (const city of targetCities) {
            startUrls.push({ url: `https://www.facebook.com/marketplace/${city}/search?query=${encodeURIComponent(make)}&category_id=vehicles&sort=CREATION_TIME_DESCEND` });
        }
    }

    // 2. Shuffle and pick a batch
    startUrls.sort(() => Math.random() - 0.5);
    const finalUrls = startUrls.slice(0, BATCH_SIZE);

    console.log(`\n🎯 Selected ${BATCH_SIZE} URLs for this chunk.`);

    // 3. Configure Apify for CHEAP and FAST execution
    const input = {
        urls: finalUrls.map(u => u.url), 
        maxPagesPerUrl: 1, // Only grab the very first page of results to save costs
        maxItems: 500,     // Hard limit
        proxyConfiguration: { 
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
            apifyProxyCountry: 'US'
        },
        onlyPublic: false,
        useFilters: true,
        scrapeDetails: false // CRITICAL FOR COST: Do NOT navigate into listing pages using Apify compute!
    };

    // 4. Run Synchronously
    console.log('📡 Calling Apify Actor (curious_coder/facebook-marketplace)...');
    try {
        // .call waits for completion
        const run = await apifyClient.actor('curious_coder/facebook-marketplace').call(input);
        console.log(`✅ Apify Run Complete. Fetching dataset ${run.defaultDatasetId}...`);

        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        console.log(`📦 Received ${items.length} raw listings.`);

        // 5. Process and Save
        let processedCount = 0;
        const newListingIds: string[] = [];

        for (const rawItem of items) {
            try {
                const item = rawItem as any;
                const description = item.description || item.redacted_description?.text || '';
                const title = item.marketplace_listing_title || item.custom_title || item.title || '';
                
                if (isJunkTitle(title, description)) continue;
                
                const parsed = parseListingText(title, description);
                if (parsed.isJunk) continue;

                const externalId = (item.id || item.listingUrl?.match(/item\/(\d+)/)?.[1] || item.url?.match(/item\/(\d+)/)?.[1] || Math.random().toString()).toString();
                const listingUrl = externalId.match(/^\d+$/) ? `https://www.facebook.com/marketplace/item/${externalId}/` : item.listingUrl || item.url || '';
                
                const priceCents = item.listing_price?.amount 
                  ? Math.round(parseFloat(item.listing_price.amount) * 100) 
                  : (item.price ? Math.round(parseFloat(item.price) * 100) : 0);

                const imageUrls = [
                  item.primary_listing_photo_url,
                  ...(item.listing_photos?.map((p: any) => p.image?.uri || p.url) || []),
                  ...(item.all_listing_photos?.map((p: any) => p.image?.uri) || []),
                  ...(item.additional_photos?.map((p: any) => p.uri) || [])
                ].filter(Boolean);

                const listingData = {
                  externalId, source: 'facebook', rawTitle: title, description, listingUrl,
                  price: priceCents, imageUrls: Array.from(new Set(imageUrls)),
                  city: item.location_text?.text?.split(',')[0]?.trim() || item.city || null,
                  state: item.location_text?.text?.split(',')[1]?.trim() || item.state || null,
                  postedAt: item.creation_time ? new Date(item.creation_time * 1000) : new Date(),
                  make: parsed.make, model: parsed.model, year: parsed.year, mileage: parsed.mileage,
                  trim: parsed.trim, bodyStyle: parsed.bodyStyle, driveType: parsed.driveType,
                  engine: parsed.engine, transmission: parsed.transmission, fuelType: parsed.fuelType,
                  color: parsed.color, doors: parsed.doors, titleStatus: parsed.titleStatus,
                  condition: parsed.condition, accidents: parsed.accidents, owners: parsed.owners,
                  features: parsed.features, vin: parsed.vin, isJunk: parsed.isJunk,
                  isCar: !parsed.isJunk && parsed.make !== "Unknown", parseScore: parsed.parseScore,
                  parsedAt: new Date(),
                };

                // Use update/create to catch new items
                const listing = await prisma.listing.upsert({
                  where: { externalId: listingData.externalId },
                  update: { ...listingData, postedAt: listingData.postedAt }, 
                  create: listingData,
                });

                if (listing) {
                    processedCount++;
                    if (listing.make === 'Unknown' || listing.parseScore < 50 || !listing.mileage) {
                        newListingIds.push(listing.id);
                    }
                }
            } catch(e) {
                console.error('Error processing item:', e);
            }
        }

        console.log(`💾 Saved ${processedCount} valid listings to DB. ${newListingIds.length} need enrichment.`);

        // 6. Enrich (Fix) Silently and Locally
        if (newListingIds.length > 0) {
            console.log(`\n🛠️ Starting silent enrichment...`);
            let fixCount = 0;
            for (const id of newListingIds) {
                const success = await enrichListingDetails(id);
                if (success) {
                    const updated = await prisma.listing.findUnique({ where: { id } });
                    if (updated) {
                        console.log(`✅ [${++fixCount}/${newListingIds.length}] Fixed: ${updated.year} ${updated.make} ${updated.model}`);
                        try { await matchListingToSubscriptions(updated); } catch(e){}
                    }
                }
                // Random sleep to stay completely undetected
                await delay(1500 + Math.random() * 2000);
            }
        }

    } catch (e: any) {
        console.error('❌ Cycle Failed:', e.message);
    }

    console.log('\n💤 Cycle complete. Sleeping for 2 minutes before next batch...');
    await delay(120 * 1000); // Wait 2 minutes between Apify runs
}

// Endless Loop
async function startServerSync() {
    console.log('🚀 Starting Endless Server Sync Worker');
    while (true) {
        await runSyncCycle();
    }
}

startServerSync().catch(console.error);
