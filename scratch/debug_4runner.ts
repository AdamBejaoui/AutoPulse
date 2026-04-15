
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main() {
    // Find the 4runner listing by parts of its title
    const listing = await prisma.listing.findFirst({
        where: {
            OR: [
                { rawTitle: { contains: "4runner" } },
                { rawTitle: { contains: "24 995" } }
            ]
        }
    });

    if (listing) {
        console.log("Found Listing:");
        console.log(`- Title: ${listing.rawTitle}`);
        console.log(`- rawDescription (Length: ${listing.rawDescription?.length}):\n${listing.rawDescription}`);
        console.log(`- description (Length: ${listing.description?.length}):\n${listing.description}`);
    } else {
        console.log("Listing not found.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
