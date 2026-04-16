import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("[cleanup] Starting database purge of junk listings...");
    
    const { count } = await prisma.listing.deleteMany({
        where: {
            OR: [
                { rawTitle: { contains: "Marketplace Listing" } },
                { price: 0 },
                { description: { contains: "Use Facebook app" } },
                { description: { contains: "AutoPulse local capture: Marketplace Listing" } }
            ]
        }
    });

    console.log(`[cleanup] Successfully purged ${count} junk listings.`);
}

main()
    .catch((e) => {
        console.error("[cleanup] Failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
