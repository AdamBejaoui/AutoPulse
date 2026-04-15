const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function count() {
  const total = await prisma.listing.count();
  const withDesc = await prisma.listing.count({ where: { description: { not: null } } });
  const withPosted = await prisma.listing.count({ where: { postedAt: { not: null } } });
  
  console.log(`Total Listings: ${total}`);
  console.log(`Listings with Description: ${withDesc}`);
  console.log(`Listings with Posted Time: ${withPosted}`);
  process.exit(0);
}

count();
