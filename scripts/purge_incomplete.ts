import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function purgeIncomplete() {
  console.log('🚮 Purging incomplete listings missing Mileage or Location...');
  
  const result = await prisma.listing.deleteMany({
    where: {
      OR: [
        { mileage: null },
        { city: null }
      ]
    }
  });
  
  console.log(`✅ Successfully deleted ${result.count} incomplete listings!`);
  await prisma.$disconnect();
}

purgeIncomplete();
