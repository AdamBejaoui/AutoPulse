
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";
import { parseTilePriceToCents } from "../lib/scrapers/localFacebook";

async function main() {
    console.log("[Reparse] Fetching listings with price 0...");
    
    const listings = await prisma.listing.findMany({
        where: {
            price: 0
        },
        take: 10,
        select: {
            id: true,
            rawTitle: true,
            rawDescription: true,
            price: true
        }
    });

    console.log(`[Reparse] Found ${listings.length} listings to check.`);
    
    let updated = 0;
    for (const listing of listings) {
        const textToParse = `${listing.rawTitle || ""} ${listing.rawDescription || ""}`;
        if (!textToParse.trim()) continue;

        const newPrice = parseTilePriceToCents(textToParse);
        
        if (newPrice > 0) {
            await prisma.listing.update({
                where: { id: listing.id },
                data: { price: newPrice }
            });
            updated++;
            if (updated % 50 === 0) {
                console.log(`[Reparse] Updated ${updated} listings...`);
            }
        }
    }

    console.log(`[Reparse] COMPLETE. Updated ${updated} listings that were previously 'FREE'.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
