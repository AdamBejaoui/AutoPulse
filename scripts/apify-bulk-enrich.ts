import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { parseListingText } from '../lib/parser/listingParser';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

async function runApifyBulkEnrich() {
    console.log('🚀 Starting Apify-backed Bulk Enrichment...');

    const incomplete = await prisma.listing.findMany({
        where: {
            OR: [
                { mileage: null },
                { city: null }
            ],
            isJunk: false
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
    });

    if (incomplete.length === 0) {
        console.log('✅ No incomplete listings found. Done!');
        await prisma.$disconnect();
        return;
    }

    console.log(`Found ${incomplete.length} listings targeting details. Mapping URLs...`);
    const startUrls = incomplete.map(car => ({ url: car.listingUrl })).filter(u => u.url && u.url !== 'none');

    if (startUrls.length === 0) {
        console.log('❌ No valid URLs to scrape.');
        await prisma.$disconnect();
        return;
    }

    try {
        console.log(`📡 Launching Apify Actor with ${startUrls.length} targeted links...`);
        const run = await apifyClient.actor('apify/facebook-marketplace-scraper').call({
            startUrls: startUrls,
            scrapeDetails: true,
            maxResults: startUrls.length,
            proxyConfiguration: { useApifyProxy: true }
        });

        console.log(`✅ Apify run ${run.id} finished. Loading results...`);
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        
        let count = 0;
        for (const item of items) {
            const externalId = (item.id || item.listingUrl?.match(/item\/(\d+)/)?.[1] || item.url?.match(/item\/(\d+)/)?.[1] || Math.random().toString()).toString();
            const title = String(item.title || item.marketplace_listing_title || 'Vehicle');
            const description = String(item.description || '');
            const parsed = parseListingText(title, description);

            let milesText = item.custom_sub_titles_with_rendering_flags?.find((s: any) => s.subtitle?.toLowerCase().includes('miles'))?.subtitle;
            let milesInt = milesText ? parseInt(milesText.replace(/[^\d]/g, '')) : null;
            if (milesText && milesText.toLowerCase().includes('k') && milesInt && milesInt < 1000) {
                milesInt = milesInt * 1000;
            }

            const updatedData = {
                mileage: parsed.mileage || milesInt || item.vehicle_odometer_data?.value || null,
                city: item.location_text?.text?.split(',')[0]?.trim() || item.city || item.location?.reverse_geocode?.city || null,
                state: item.location_text?.text?.split(',')[1]?.trim() || item.state || item.location?.reverse_geocode?.state || null,
                make: parsed.make !== 'Unknown' ? parsed.make : undefined,
                model: parsed.model !== 'Unknown' ? parsed.model : undefined,
                year: parsed.year || undefined,
            };

            await prisma.listing.updateMany({
                where: { externalId: externalId },
                data: updatedData
            });
            count++;
        }

        console.log(`✨ Successfully enriched details for ${count} targeted records!`);
    } catch (e: any) {
        console.error('❌ Bulk Apify operation failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function startContinuousEnrich() {
    console.log('🚀 Starting Endless Enrichment Worker');
    while (true) {
        try {
            await runApifyBulkEnrich();
        } catch (e: any) {
            console.error('💥 Enrichment Worker crashed:', e.message);
        }
        console.log('⏳ Waiting 5 minutes before enriching next batch...');
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
    }
}

startContinuousEnrich();
