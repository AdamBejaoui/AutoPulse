const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const listings = await prisma.listing.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(listings, null, 2));
  process.exit(0);
}

check();
