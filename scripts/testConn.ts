import { prisma } from "../lib/prisma";

async function test() {
  try {
    console.log("Checking DB connection...");
    const count = await prisma.listing.count();
    console.log(`Total listings: ${count}`);
  } catch (e) {
    console.error("Connection test failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
