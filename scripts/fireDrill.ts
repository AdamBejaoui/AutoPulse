import { prisma } from "../lib/prisma";
import { getAlertMatchQueue } from "../lib/queue";

async function fireDrill() {
  const testEmail = "sentinel-test@example.com";
  const carMake = "Sentinel-Tester";
  const carModel = "X-1";

  console.log("🚀 [Fire Drill] Stage 1: Creating persistent alert for " + carMake + " " + carModel);
  
  // 1. Create a subscription
  const sub = await prisma.subscription.upsert({
    where: { email: testEmail }, // Simplification for test
    update: { make: carMake, model: carModel },
    create: { email: testEmail, make: carMake, model: carModel },
  });

  console.log("✅ [Fire Drill] Alert active. Waiting for scanner hit...");

  // 2. Mock a listing appearing in the database
  setTimeout(async () => {
    console.log("📡 [Fire Drill] Stage 2: Scanner detected a match! Upserting listing...");
    
    const listing = await prisma.listing.upsert({
      where: { id: "test-listing-123" },
      update: {},
      create: {
        id: "test-listing-123",
        title: carMake + " " + carModel + " - MINT CONDITION",
        description: "Rare find. Clean title.",
        price: 5000000, // $50k
        make: carMake,
        model: carModel,
        year: 2024,
        url: "https://facebook.com/marketplace/item/123",
        images: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"],
        city: "San Francisco",
        rawTitle: carMake + " " + carModel,
        rawDescription: "Clean title",
      },
    });

    // 3. Manually trigger the queue (simulating what the scraper does)
    const queue = getAlertMatchQueue();
    await queue.add("matchListing", { listingId: listing.id });

    console.log("🔥 [Fire Drill] Stage 3: Reactive pulse triggered! Check logs for 'Alert matched'...");
    process.exit(0);
  }, 3000);
}

fireDrill();
