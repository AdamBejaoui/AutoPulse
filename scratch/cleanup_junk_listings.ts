/**
 * cleanup_junk_listings.ts
 * Deletes junk listings inserted by the broken local scraper:
 *   - "Marketplace Listing" make/model/title
 *   - French category names (Voitures, Bateaux, Caravanes, Motos, etc.)
 *   - Zero-price facebook listings with no useful make
 */

import { prisma } from "../lib/prisma";

async function main() {
  // 1. Delete "Marketplace Listing" junk (make OR model is literally "Marketplace Listing")
  const r1 = await prisma.listing.deleteMany({
    where: {
      source: "facebook",
      OR: [
        { make: "Marketplace Listing" },
        { model: "Marketplace Listing" },
        { rawTitle: "Marketplace Listing" },
      ],
    },
  });
  console.log(`Deleted ${r1.count} "Marketplace Listing" entries`);

  // 2. Delete French category nav junk
  const junkTitles = [
    "Voitures", "Bateaux", "Bateau", "Motos", "Moto",
    "Caravanes", "Caravane", "Camping-cars", "Camping-car",
    "Sports mécaniques", "Sport mécanique",
  ];
  const r2 = await prisma.listing.deleteMany({
    where: {
      source: "facebook",
      OR: [
        { make: { in: junkTitles } },
        { model: { in: junkTitles } },
        { rawTitle: { in: junkTitles } },
      ],
    },
  });
  console.log(`Deleted ${r2.count} French category nav entries`);

  // 3. Delete zero-price facebook listings where make is Unknown (nav/junk with no real data)
  const r3 = await prisma.listing.deleteMany({
    where: {
      source: "facebook",
      price: 0,
      make: "Unknown",
    },
  });
  console.log(`Deleted ${r3.count} zero-price Unknown-make entries`);

  const total = r1.count + r2.count + r3.count;
  console.log(`\n✅ Total junk removed: ${total} listings`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
