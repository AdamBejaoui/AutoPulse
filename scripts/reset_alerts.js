require('dotenv').config();

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
  console.log("No DIRECT_URL found in .env");
  process.exit(1);
}
const url = new URL(directUrl);
url.searchParams.set('connection_limit', '1');
url.searchParams.set('connect_timeout', '60');
url.searchParams.set('pool_timeout', '60');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url.toString()
    }
  }
});

const newAlerts = [
  { make: 'Mazda', model: 'CX-5', yearMin: 2013, yearMax: 2013, priceMax: 3000 },
  { make: 'Toyota', model: 'Highlander', yearMin: 2007, yearMax: 2010, priceMax: 2000 },
  { make: 'Toyota', model: 'Highlander', yearMin: 2011, yearMax: 2014, priceMax: 3500 },
  { make: 'Toyota', model: 'Corolla', yearMin: 2011, yearMax: 2013, priceMax: 2000 },
  { make: 'Toyota', model: 'Avalon', yearMin: 2011, yearMax: 2011, priceMax: 3000 },
  { make: 'Toyota', model: 'Venza', yearMin: 2011, yearMax: 2011, priceMax: 2000 },
  { make: 'Toyota', model: 'RAV4', yearMin: 2010, yearMax: 2010, priceMax: 2000 },
  { make: 'Lexus', model: 'RX 350', yearMin: 2005, yearMax: 2009, priceMax: 1800 },
  { make: 'Lexus', model: 'RX 350', yearMin: 2010, yearMax: 2010, priceMax: 3500 },
  // 2011+ with 250k+ mileage
  { make: 'Toyota', yearMin: 2011, mileageMin: 250000 },
  { make: 'Mazda', model: 'CX-5', yearMin: 2011, mileageMin: 250000 },
  { make: 'Lexus', yearMin: 2011, mileageMin: 250000 }
];

async function main() {
  console.log("Fetching emails with explicit direct URL.");
  const users = await prisma.subscription.groupBy({
    by: ['email'],
  });
  const prefs = await prisma.userPreference.findMany({
    select: { email: true }
  });
  
  const allEmails = new Set([...users.map(u => u.email), ...prefs.map(p => p.email)]);
  console.log(`Found ${allEmails.size} unique emails:`, Array.from(allEmails));
  
  if (allEmails.size === 0) {
    console.log("No users found to update.");
    return;
  }
  
  console.log("Deleting all existing subscriptions...");
  const delRes = await prisma.subscription.deleteMany({});
  console.log(`Deleted ${delRes.count} subscriptions.`);
  
  console.log("Inserting new subscriptions...");
  let count = 0;
  for (const email of allEmails) {
    for (const alert of newAlerts) {
      await prisma.subscription.create({
        data: {
          email,
          ...alert
        }
      });
      count++;
    }
  }
  
  console.log(`Successfully created ${count} new subscriptions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
