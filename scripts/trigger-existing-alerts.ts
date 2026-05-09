import { PrismaClient } from '@prisma/client';
import { matchListingToSubscriptions } from '../lib/alertMatcher';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function triggerExistingAlerts() {
  console.log("🔍 Scanning existing database for alert matches...");

  // Get all valid cars (not junk, successfully parsed)
  const existingListings = await prisma.listing.findMany({
    where: {
      isCar: true,
      isJunk: false,
      price: { gt: 0, lte: 7500 }, // Generous cap to catch anything near $7k
      make: { in: ["Mazda", "Hyundai", "Kia", "mazda", "hyundai", "kia"] }
    },
    orderBy: { createdAt: "desc" }
  });

  console.log(`Found ${existingListings.length} valid listings in the database. Cross-referencing with subscriptions...`);

  let count = 0;
  for (const listing of existingListings) {
    count++;
    if (count % 100 === 0) {
      console.log(`Processed ${count}/${existingListings.length} listings...`);
    }
    // matchListingToSubscriptions automatically handles deduplication via NotificationLog
    await matchListingToSubscriptions(listing);
  }

  console.log("✅ Finished retroactive alert sweep!");
}

triggerExistingAlerts()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
