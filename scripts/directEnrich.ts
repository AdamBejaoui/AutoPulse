
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";
import { enrichListingLocally } from "../lib/scrapers/localFacebook";

async function main() {
    const BATCH_SIZE = 100;
    const CONCURRENCY = 3; // Keep it low to avoid blocking

    console.log(`[Backfill] Starting enrichment for top ${BATCH_SIZE} listings...`);

    const listings = await prisma.listing.findMany({
        where: {
            rawDescription: {
                contains: "AutoPulse local capture"
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: BATCH_SIZE
    });

    console.log(`[Backfill] Found ${listings.length} listings to enrich.`);

    for (let i = 0; i < listings.length; i += CONCURRENCY) {
        const batch = listings.slice(i, i + CONCURRENCY);
        console.log(`[Backfill] Processing batch ${i / CONCURRENCY + 1} (${batch.length} items)...`);

        await Promise.all(batch.map(async (listing) => {
            try {
                if (!listing.listingUrl) return;

                const details = await enrichListingLocally(listing.listingUrl);
                
                if (details && (details.description || details.condition)) {
                    await prisma.listing.update({
                        where: { id: listing.id },
                        data: {
                            rawDescription: details.description || listing.rawDescription,
                            description: details.description || listing.description,
                            condition: details.condition || listing.condition,
                            parsedAt: new Date(),
                            updatedAt: new Date()
                        }
                    });
                    console.log(`✅ [Backfill] Enriched: ${listing.rawTitle?.substring(0, 30)}...`);
                } else {
                    console.log(`⚠️ [Backfill] No extra data found for: ${listing.rawTitle?.substring(0, 30)}...`);
                }
            } catch (err) {
                console.error(`❌ [Backfill] Error enriching ${listing.id}:`, err);
            }
        }));

        // Small delay between batches
        if (i + CONCURRENCY < listings.length) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    console.log(`[Backfill] Completed!`);
    await prisma.$disconnect();
}

main().catch(console.error);
