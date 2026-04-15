const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log("Cleaning up corrupted '[object Object]' descriptions...");
  const result = await prisma.listing.updateMany({
    where: {
      description: {
        contains: "[object Object]"
      }
    },
    data: {
      description: null
    }
  });
  console.log(`Successfully cleared ${result.count} corrupted descriptions.`);
  process.exit(0);
}

clean().catch(console.error);
