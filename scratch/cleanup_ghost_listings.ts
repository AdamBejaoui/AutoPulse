import { prisma } from "../lib/prisma";
import { isJunkTitle } from "../lib/parser/listingParser";

async function cleanupGhostListings() {
  console.log("👻 Starting Ghost Listing Cleanup...");

  // 1. Find all listings with missing images or unparseable identity
  const candidates = await prisma.listing.findMany({
    where: {
      OR: [
        { imageUrl: null },
        { imageUrl: "" },
        { make: "Unknown" },
        { model: "Unknown" },
      ]
    },
    select: {
      id: true,
      rawTitle: true,
      make: true,
      model: true,
      imageUrl: true,
    }
  });

  console.log(`🔍 Found ${candidates.length} candidate listings for cleanup.`);

  let deletedCount = 0;
  for (const item of candidates) {
    const isJunk = isJunkTitle(item.rawTitle || "");
    const hasNoImg = !item.imageUrl || item.imageUrl.trim().length === 0;

    // AGGRESSIVE DECISION:
    // - Delete if explicitly junk
    // - Delete if no image (regardless of identity)
    if (isJunk || hasNoImg) {
        await prisma.listing.delete({ where: { id: item.id } });
        deletedCount++;
    }
  }

  console.log(`✅ Cleanup complete. Deleted ${deletedCount} ghost listings.`);
}

cleanupGhostListings()
  .catch(e => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
