import { PrismaClient } from '@prisma/client';
import { enrichListingDetails } from '../lib/scraper/enricher';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
const prisma = new PrismaClient();

async function bulkEnrich() {
    console.log('👷 Starting FREE Bulk Detail Sync...');
    
    // Find cars with "Unknown" or missing details
    const targets = await prisma.listing.findMany({
        where: {
            OR: [
                { make: 'Unknown' },
                { mileage: null },
                { description: { contains: 'pending' } }
            ],
            isJunk: false
        },
        take: 500, // Processing a large batch to fix everything
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${targets.length} cars that need details. Starting sync...`);

    let count = 0;
    for (const car of targets) {
        try {
            const success = await enrichListingDetails(car.id);
            if (success) {
                console.log(`✅ [${++count}/${targets.length}] Enriched: ${car.rawTitle}`);
            } else {
                console.log(`⚠️  [${++count}/${targets.length}] Failed: ${car.rawTitle}`);
            }
        } catch (e) {
            console.error(`Error with ${car.id}:`, e);
        }
    }

    console.log('\n✨ Done! Refresh your site to see the full details.');
    await prisma.$disconnect();
}

bulkEnrich().catch(console.error);
