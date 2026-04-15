const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      rawTitle: true,
      price: true,
      externalId: true
    }
  });
  console.log(JSON.stringify(listings, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
