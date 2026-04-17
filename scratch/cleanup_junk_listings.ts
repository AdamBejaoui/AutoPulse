/**
 * cleanup_junk_listings.ts
 * Upgraded Production Cleanup Script:
 * 1. Deletes "ghost" entries with placeholder titles.
 * 2. Purges category navigation nodes (French/English).
 * 3. IMPLEMENTS FUZZY DEDUPLICATION: Removes identical listings with different IDs.
 */

import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🚀 Starting Production Database Cleanup...");

  // --- PART 1: Strict Pattern Cleanup ---
  const junkPatterns = [
    "Marketplace Listing",
    "Voitures", "Bateaux", "Bateau", "Motos", "Moto",
    "Caravanes", "Caravane", "Camping-cars", "Camping-car",
    "Sports mécaniques", "Sport mécanique",
    "Powersports", "RV", "Campers", "Boats", "Trailers",
    "Vehicles", "Cars", "Trucks", "Unknown"
  ];

  const r1 = await prisma.listing.deleteMany({
    where: {
      source: "facebook",
      OR: [
        { make: { in: junkPatterns, mode: 'insensitive' } },
        { model: { in: junkPatterns, mode: 'insensitive' } },
        { rawTitle: { contains: "Marketplace Listing", mode: 'insensitive' } },
        { price: 0 }
      ],
    },
  });
  console.log(`✅ Removed ${r1.count} pattern-based junk entries.`);

  // --- PART 2: Semantic Deduplication ---
  console.log("🔍 Checking for semantic duplicates (identical specs, different IDs)...");
  
  // We fetch all active listings to find clusters of identical cars
  const allListings = await prisma.listing.findMany({
    where: { source: "facebook" },
    select: {
      id: true,
      externalId: true,
      make: true,
      model: true,
      year: true,
      price: true,
      mileage: true,
      city: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const seen = new Map<string, string>(); // key: specs -> id: recordId
  const toDelete: string[] = [];

  for (const l of allListings) {
    const key = `${l.make}|${l.model}|${l.year}|${l.price}|${l.mileage}|${l.city}`.toLowerCase();
    
    if (seen.has(key)) {
      // We already have a newer version of this exact listing (ordered by desc)
      toDelete.push(l.id);
    } else {
      seen.set(key, l.id);
    }
  }

  if (toDelete.length > 0) {
    console.log(`🗑️ Found ${toDelete.length} semantic duplicates. Purging...`);
    
    // Prisma deleteMany with large arrays can be slow, we'll do it in chunks if necessary
    const chunkSize = 100;
    for (let i = 0; i < toDelete.length; i += chunkSize) {
      const chunk = toDelete.slice(i, i + chunkSize);
      await prisma.listing.deleteMany({
        where: { id: { in: chunk } }
      });
    }
    console.log(`✅ Purged ${toDelete.length} duplicate entries.`);
  } else {
    console.log("✨ No semantic duplicates found.");
  }

  console.log("\n🏁 Cleanup Complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
