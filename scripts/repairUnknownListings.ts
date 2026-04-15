import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";
import { enrichListingLocally } from "../lib/scrapers/localFacebook";
import { parseListingText } from "../lib/parser/listingParser";

async function main(): Promise<void> {
  const limit = Math.max(1, Number(process.env.REPAIR_UNKNOWN_LIMIT ?? 100));
  const rows = await prisma.listing.findMany({
    where: {
      OR: [
        { make: "Unknown" },
        { model: "Unknown" },
        { price: 0 },
        { description: { startsWith: "AutoPulse local capture:" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      listingUrl: true,
      rawTitle: true,
      make: true,
      model: true,
      price: true,
    },
  });

  let fixed = 0;
  for (const row of rows) {
    const details = await enrichListingLocally(row.listingUrl);
    if (!details) continue;
    const title = details.detailTitle || row.rawTitle || "Listing";
    const description = details.description || "";
    const parsed = parseListingText(title, description);

    await prisma.listing.update({
      where: { id: row.id },
      data: {
        make:
          parsed.make !== "Unknown"
            ? parsed.make
            : row.make !== "Unknown"
              ? undefined
              : parsed.make,
        model:
          parsed.model !== "Unknown"
            ? parsed.model
            : row.model !== "Unknown"
              ? undefined
              : parsed.model,
        year: parsed.year > 0 ? parsed.year : undefined,
        price: details.priceCents && details.priceCents > 0 ? details.priceCents : undefined,
        imageUrl: details.imageUrl || undefined,
        description: details.description || undefined,
        postedAt: details.postedAt || undefined,
        trim: parsed.trim,
        bodyStyle: parsed.bodyStyle,
        driveType: parsed.driveType,
        engine: parsed.engine,
        transmission: parsed.transmission,
        fuelType: parsed.fuelType,
        color: parsed.color,
        doors: parsed.doors,
        titleStatus: parsed.titleStatus,
        condition: parsed.condition,
        owners: parsed.owners,
        accidents: parsed.accidents,
        features: parsed.features,
        rawTitle: title,
        rawDescription: details.description || undefined,
        parseScore: parsed.parseScore,
        parsedAt: new Date(),
      },
    });
    fixed += 1;
  }

  console.log(`[repairUnknownListings] scanned=${rows.length} fixed=${fixed}`);
}

main()
  .catch((err) => {
    console.error("[repairUnknownListings] failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
