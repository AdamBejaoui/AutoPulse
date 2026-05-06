import { PrismaClient } from '@prisma/client';
import { enrichListingDetails } from '../lib/scraper/enricher';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
const prisma = new PrismaClient();

async function bulkEnrich() {
    console.log('👷 Starting Bulk Detail Sync...');
    
    // Find cars with "Unknown" or missing details or zero price
    const targets = await prisma.listing.findMany({
        where: {
            OR: [
                { make: 'Unknown' },
                { mileage: null },
                { price: 0 },
                { rawTitle: '' },
                { rawTitle: 'Vehicle' },
                { description: 'Details pending deep scan...' }
            ],
            isJunk: false
        },
        take: 200, // Processing a reasonable batch
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${targets.length} cars that need details. Starting sync...`);
    const { matchListingToSubscriptions } = await import('../lib/alertMatcher');

    let count = 0;
    // Add a small delay between requests to remain undetected and avoid rate limits
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const car of targets) {
        try {
            const success = await enrichListingDetails(car.id);
            if (success) {
                // Fetch the updated listing to get new make/model/etc.
                const updated = await prisma.listing.findUnique({ where: { id: car.id } });
                if (updated) {
                    console.log(`✅ [${++count}/${targets.length}] Enriched & Checking Alerts: ${updated.year} ${updated.make} ${updated.model}`);
                    await matchListingToSubscriptions(updated);
                }
            } else {
                console.log(`⚠️  [${++count}/${targets.length}] Failed to enrich: ${car.rawTitle}`);
            }
            
            // Wait 1-3 seconds randomly to remain undetected
            await delay(1000 + Math.random() * 2000);
        } catch (e) {
            console.error(`Error with ${car.id}:`, e);
        }
    }

    console.log('\n✨ Done! Refresh your site to see the full details.');
    await prisma.$disconnect();
}

bulkEnrich().catch(console.error);
