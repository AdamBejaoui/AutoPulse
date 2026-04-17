import { prisma } from "./lib/prisma";

async function test() {
  try {
    const count = await prisma.listing.count();
    console.log(`Connection successful. Total listings: ${count}`);
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
