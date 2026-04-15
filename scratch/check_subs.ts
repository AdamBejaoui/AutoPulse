
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Checking database...");
  const count = await prisma.subscription.count();
  console.log(`SUBSCRIPTION_COUNT: ${count}`);
  
  if (count > 0) {
    const subs = await prisma.subscription.findMany({ take: 5 });
    console.log("RECENT_SUBSCRIPTIONS:", JSON.stringify(subs, null, 2));
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
