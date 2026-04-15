
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main() {
  const testEmail = "abejaoui90@gmail.com";
  const testMake = "TEST-MATCH";
  const testModel = "ALERT-2024";

  console.log(`Setting up test case for ${testEmail}...`);

  // 1. Create/Update Subscription
  const sub = await prisma.subscription.upsert({
    where: { id: "test-alert-id" }, // Using a fixed ID for easy debugging
    create: {
      id: "test-alert-id",
      email: testEmail,
      make: testMake,
      model: testModel,
      lastCheckedAt: new Date(Date.now() - 3600000), // Checked 1 hour ago
    },
    update: {
      email: testEmail,
      make: testMake,
      model: testModel,
      lastCheckedAt: new Date(Date.now() - 3600000),
    }
  });
  console.log("✅ Subscription ready:", sub.id);

  // 2. Create Matching Listing
  const listing = await prisma.listing.create({
    data: {
      externalId: `test-match-${Date.now()}`,
      source: "test",
      make: testMake,
      model: testModel,
      year: 2024,
      price: 9999900, // $99,999
      listingUrl: "https://example.com/test-listing",
      city: "TestCity",
      state: "TS",
      description: "Automated test listing for alert verification.",
      createdAt: new Date(), // Created NOW
    }
  });
  console.log("✅ Matching listing created:", listing.id);

  console.log("\nSetup complete. You can now run triggerAlerts.ts to send the email.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
