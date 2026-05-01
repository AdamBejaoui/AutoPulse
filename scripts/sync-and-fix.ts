import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { ApifyClient } from 'apify-client';
import { prisma } from '../lib/db';
import { parseListingText, isJunkTitle } from '../lib/parser/listingParser';
import { enrichListingDetails } from '../lib/scraper/enricher';
import { matchListingToSubscriptions } from '../lib/alertMatcher';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

const BATCH_SIZE = 30; // Increased to cover 1,428 URLs faster
let urlIndex = 0; // Persistent index for sequential processing

const targetMakes = ['Toyota', 'Honda', 'Mazda', 'Lexus'];
const targetCities = ["houston","philadelphia","san-antonio","dallas","austin","jacksonville","fort-worth","columbus","charlotte","indianapolis","denver","el-paso","nashville","detroit","oklahoma-city","memphis","louisville","albuquerque","kansas-city","atlanta","omaha","colorado-springs","raleigh","miami","virginia-beach","minneapolis","tulsa","arlington","new-orleans","wichita","cleveland","tampa","aurora","corpus-christi","lexington","st-louis","saint-paul","pittsburgh","cincinnati","lincoln","orlando","durham","laredo","fort-wayne","charleston","birmingham","baton-rouge","fayetteville","shreveport","des-moines","richmond","little-rock","tallahassee","knoxville","salt-lake-city","huntsville","sioux-falls","grand-rapids","mobile","fargo","casper","cheyenne","savannah","augusta","montgomery","greenville-sc","columbia-sc","springfield-mo","allentown","grand-junction","fort-collins","rapid-city","cedar-rapids","quad-cities","evansville","south-bend","bowling-green","chattanooga","clarksville","asheville","wilmington","greensboro","winston-salem","myrtle-beach","macon","pensacola","gainesville","fort-myers","sarasota","daytona-beach","greeley","boulder","pueblo","ocala","panama-city","st-augustine","palm-bay","melbourne","port-st-lucie","fort-pierce","lakeland","winter-haven","bradenton","naples","fort-walton-beach","athens-ga","valdosta","albany-ga","muncie","terre-haute","lafayette-in","anderson-in","ames","iowa-city","waterloo-ia","dubuque","lawrence-ks","manhattan-ks","topeka","salina-ks","hutchinson","owensboro","paducah","lake-charles","lafayette-la","houma","monroe-la","alexandria-la","ann-arbor","lansing","flint","kalamazoo","saginaw","muskegon","traverse-city","duluth","rochester-mn","st-cloud","mankato","columbia-mo","st-joseph","joplin","grand-island","kearney","las-cruces","santa-fe","roswell","farmington-nm","wilmington-nc","jacksonville-nc","gastonia","high-point","grand-forks","minot","akron","dayton","toledo","youngstown","canton-oh","norman","broken-arrow","edmond","lawton","erie","reading-pa","scranton","lancaster-pa","harrisburg","spartanburg","rock-hill","rapid-city-sd","murfreesboro","jackson-tn","johnson-city","plano","lubbock","irving","garland","amarillo","brownsville","pasadena-tx","mesquite-tx","mcallen","killeen","denton","midland-tx","odessa-tx","abilene","beaumont","waco","tyler","college-station","longview-tx","san-angelo","ogden","provo","st-george","logan","charleston-wv","huntington-wv","morgantown","rock-springs","gillette","laramie"];

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

    // 2. Sequential processing to ensure no city is skipped for too long
    // Instead of random, we slice based on a persistent index
    const finalUrls = startUrls.slice(urlIndex, urlIndex + BATCH_SIZE);
    urlIndex += BATCH_SIZE;
    if (urlIndex >= startUrls.length) urlIndex = 0; // Reset once we've covered everything

    console.log(`\n🎯 Selected ${BATCH_SIZE} URLs for this chunk.`);

    // 3. Configure Apify for CHEAP and FAST execution
    const input = {
        urls: finalUrls.map(u => u.url), 
        maxPagesPerUrl: 1, // ONLY Page 1 for maximum freshness
        maxItems: 200,     // Reduced to keep it fast
        proxyConfiguration: { 
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
            apifyProxyCountry: 'US'
        },
        onlyPublic: false,
        useFilters: true,
        scrapeDetails: true // CHANGED: Enable deep extraction of specs!
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
        const perfectListingIds: string[] = [];

        for (const rawItem of items) {
            try {
                // Throttle slightly to prevent hammering the database pooled connections
                await delay(100);

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

                let milesText = item.custom_sub_titles_with_rendering_flags?.find((s: any) => s.subtitle?.toLowerCase().includes('miles'))?.subtitle;
                let milesInt = milesText ? parseInt(milesText.replace(/[^\d]/g, '')) : null;
                if (milesText && milesText.toLowerCase().includes('k') && milesInt && milesInt < 1000) {
                    milesInt = milesInt * 1000;
                }

                const listingData = {
                  externalId, source: 'facebook', rawTitle: title, description, listingUrl,
                  price: priceCents, imageUrls: Array.from(new Set(imageUrls)),
                  city: item.location_text?.text?.split(',')[0]?.trim() || item.city || item.location?.reverse_geocode?.city || null,
                  state: item.location_text?.text?.split(',')[1]?.trim() || item.state || item.location?.reverse_geocode?.state || null,
                  postedAt: item.creation_time ? new Date(item.creation_time * 1000) : null,
                  make: parsed.make, model: parsed.model, year: parsed.year, 
                  mileage: parsed.mileage || milesInt || item.vehicle_odometer_data?.value || null,
                  trim: parsed.trim, bodyStyle: parsed.bodyStyle, driveType: parsed.driveType,
                  engine: parsed.engine, transmission: parsed.transmission, fuelType: parsed.fuelType,
                  color: parsed.color, doors: parsed.doors, titleStatus: parsed.titleStatus,
                  condition: parsed.condition, accidents: parsed.accidents, owners: parsed.owners,
                  features: parsed.features, vin: parsed.vin, isJunk: parsed.isJunk,
                  isCar: !parsed.isJunk && parsed.make !== "Unknown", parseScore: parsed.parseScore,
                  parsedAt: new Date(),
                };

                const existing = await prisma.listing.findUnique({
                  where: { externalId: listingData.externalId },
                  select: { id: true }
                });

                // Use update/create to catch new items
                const listing = await prisma.listing.upsert({
                  where: { externalId: listingData.externalId },
                  update: { ...listingData, postedAt: listingData.postedAt }, 
                  create: listingData,
                });

                if (listing) {
                    processedCount++;
                    // ONLY process (enrich & email) if this is the FIRST time we've seen this car
                    if (!existing) {
                        if (listing.make === 'Unknown' || listing.parseScore < 50 || !listing.mileage) {
                            newListingIds.push(listing.id);
                        } else {
                            // It's already perfect, no enrichment needed
                            perfectListingIds.push(listing.id);
                        }
                    }
                }
            } catch(e) {
                console.error('Error processing item:', e);
            }
        }

        console.log(`💾 Saved ${processedCount} valid listings to DB. ${newListingIds.length} need enrichment. ${perfectListingIds.length} are perfect.`);

        // 5.5 Send emails immediately for PERFECT new listings
        for (const id of perfectListingIds) {
            const perfectListing = await prisma.listing.findUnique({ where: { id } });
            if (perfectListing) {
                try { await matchListingToSubscriptions(perfectListing); } catch(e){}
            }
        }

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
    } finally {
        // 7. BACKLOG CATCH-UP
        // Only look for cars from the last 1 hour that have NO notification logs at all.
        // This catches system hiccups without re-processing everything.
        console.log('\n🔍 Checking for missed matches (Backlog Catch-up)...');
        try {
            const recentUnnotified = await prisma.listing.findMany({
                where: {
                    createdAt: { gte: new Date(Date.now() - 1 * 60 * 60 * 1000) },
                    isJunk: false,
                    isCar: true,
                    notificationLogs: { none: {} } // ONLY cars that were never matched
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });
            if (recentUnnotified.length > 0) {
                console.log(`✉️ Found ${recentUnnotified.length} recent cars needing matching. Processing...`);
                for (const l of recentUnnotified) {
                    await matchListingToSubscriptions(l);
                    await delay(500); // Small throttle
                }
            }
        } catch (e) {
            console.error('❌ Backlog catch-up failed:', e);
        }

        console.log('🔌 Releasing database connection slots...');
        await prisma.$disconnect().catch(() => {});
    }

    console.log(`\n💤 Cycle complete. Covered ${finalUrls.length} URLs. Queue progress: ${urlIndex}/${startUrls.length}`);
    console.log('Sleeping for 3 minutes before next batch...');
    await delay(3 * 60 * 1000); // Reduced to 3 minutes to cover cities faster
}

// Endless Loop
async function startServerSync() {
    console.log('🚀 Starting Endless Server Sync Worker');
    while (true) {
        try {
            await runSyncCycle();
        } catch (e: any) {
            console.error('💥 Critical error in startServerSync:', e.message);
            console.log('⏳ Waiting 30 seconds to allow connection slots to clear...');
            await delay(30000);
        }
    }
}

startServerSync().catch(console.error);
