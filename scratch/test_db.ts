import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Connecting to Database...");
    try {
        const count = await prisma.listing.count();
        console.log("Connection successful. Listing count:", count);
    } catch (e) {
        console.error("Connection failed!");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
