import { prisma } from "../lib/prisma";
import { findMatchingSubscriptions } from "../lib/alertMatcher";

async function dryRunAlert() {
  const targetEmail = "sentinel-owner@example.com";
  const targetMake = "Tesla";
  const targetModel = "Model S";

  console.log("🛠️ [Dry Run] 1. Setting up a 'Sentinel' alert for: " + targetMake + " " + targetModel);
  
  // Cleanup
  await prisma.subscription.deleteMany({ where: { email: targetEmail } });

  // Create
  await prisma.subscription.create({
    data: {
      email: targetEmail,
      make: targetMake,
      model: targetModel,
      keywords: ["Autopilot", "Plaid"],
      requiredFeatures: [],
    },
  });

  console.log("📡 [Dry Run] 2. Simulating a new listing discovery...");
  
  const mockListing = {
    id: "mock-id-" + Date.now(),
    title: "2023 Tesla Model S Plaid - Carbon Edition",
    description: "Mint condition Model S. Full Autopilot equipped. Very fast.",
    price: 8500000,
    make: "Tesla",
    model: "Model S",
    year: 2023,
    url: "https://fb.com/mock",
    images: [],
    city: "Los Angeles",
    rawTitle: "2023 Tesla Model S Plaid",
    rawDescription: "Autopilot equipped",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  console.log("🧠 [Dry Run] 3. Running Reactive Matcher Logic...");
  
  const matches = await findMatchingSubscriptions(mockListing);

  const matched = matches.some(m => m.email === targetEmail);

  if (matched) {
    console.log("🔥 [MATCH FOUND!] The system correctly identified the listing!");
    console.log("   Uplink: Real-time alert would have been transmitted to: " + targetEmail);
  } else {
    console.log("❌ [No Match] The logic did not identify the match.");
  }
  
  process.exit(0);
}

dryRunAlert();
