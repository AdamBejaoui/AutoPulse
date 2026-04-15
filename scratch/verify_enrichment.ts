
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main() {
    const listing = await prisma.listing.findFirst({
        where: {
            rawDescription: {
                not: {
                    contains: "AutoPulse local capture"
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    if (listing) {
        console.log("-----------------------------------------");
        console.log(`Title: ${listing.rawTitle}`);
        console.log(`Condition: ${listing.condition || "N/A"}`);
        console.log(`Description Snippet: ${listing.rawDescription?.substring(0, 500)}...`);
        console.log("-----------------------------------------");
    } else {
        console.log("No enriched listings found.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
