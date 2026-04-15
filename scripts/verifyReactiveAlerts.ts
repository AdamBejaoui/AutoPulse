import { prisma } from "../lib/prisma";
import { findMatchingSubscriptions } from "../lib/alertMatcher";
import { Listing } from "@prisma/client";

async function verify() {
  console.log("🧪 Starting Verification: Reactive Alert Matching");

  const testEmail = "test-alert@example.com";
  
  // 1. Cleanup old test data
  await prisma.subscription.deleteMany({ where: { email: testEmail } });

  // 2. Create a test subscription
  const sub = await prisma.subscription.create({
    data: {
      email: testEmail,
      make: "Toyota",
      model: "Supra",
      priceMax: 10000000, // 100k
      keywords: ["manual", "turbo", "clean title"]
    }
  });
  console.log(`✅ Created test subscription for ${testEmail}`);

  // 3. Mock a matching listing
  const mockListing: Partial<Listing> = {
    externalId: "test-listing-123",
    make: "Toyota",
    model: "Supra",
    year: 2022,
    price: 6500000, // 65k
    titleStatus: "clean",
    rawTitle: "2022 Toyota Supra - Manual Transmission - Turbo",
    rawDescription: "Amazing car, clean title, low miles.",
    city: "New York",
    state: "NY"
  };

  // 4. Test Match
  const matches = await findMatchingSubscriptions(mockListing as Listing);
  
  const found = matches.some(m => m.id === sub.id);
  if (found) {
    console.log("🔥 SUCCESS: Test listing matched the subscription!");
  } else {
    console.error("❌ FAILURE: Test listing did NOT match the subscription.");
  }

  // 5. Test Non-Match (different model)
  const failListing: Partial<Listing> = {
    ...mockListing,
    model: "Camry"
  };
  const failMatches = await findMatchingSubscriptions(failListing as Listing);
  if (failMatches.length === 0) {
    console.log("✅ SUCCESS: Non-matching listing correctly ignored.");
  } else {
    console.error("❌ FAILURE: Non-matching listing was incorrectly matched.");
  }

  // Cleanup
  await prisma.subscription.delete({ where: { id: sub.id } });
  console.log("🧹 Cleanup complete.");
}

verify().catch(console.error).finally(() => prisma.$disconnect());
