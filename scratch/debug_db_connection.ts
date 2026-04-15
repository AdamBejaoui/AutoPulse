
import { prisma } from '../lib/prisma';

async function main() {
  try {
    console.log('Attempting to connect to database using Prisma Driver Adapter (@prisma/adapter-pg)...');
    const result = await prisma.listing.count();
    console.log('Successfully connected! Total listings:', result);
  } catch (e) {
    console.error('Connection failed:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
