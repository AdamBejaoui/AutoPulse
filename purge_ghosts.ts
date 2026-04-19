import "./lib/envBootstrap";
import { prisma } from "./lib/prisma";

async function purgeGhosts() {
    console.log("🧹 Purging totally corrupted ghost prices from the old scraper...");
    
    const count = await prisma.listing.deleteMany({
        where: {
            price: { lte: 20000 } // Any car under $200 (20,000 cents) is almost mathematically guaranteed to be a scraper regex ghost.
        }
    });

    console.log(`✅ Deleted ${count.count} corrupted listings. They will be re-scraped perfectly on the next sweep!`);
}

purgeGhosts().catch(console.error).finally(() => process.exit(0));
