import { prisma } from "../lib/prisma";
import { parseListingText } from "../lib/parser/listingParser";

async function run() {
  console.log("Starting one-off reparse...");
  const listings = await prisma.listing.findMany({
    where: { parsedAt: null }
  });

  console.log(`Found ${listings.length} listings to parse.`);
  let count = 0;

  for (const listing of listings) {
    const text = (listing.rawTitle || (listing.make + " " + listing.model)) + " " + (listing.description || "");
    const parsed = parseListingText(text, "");
    
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
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
        accidents: parsed.accidents,
        owners: parsed.owners,
        features: parsed.features,
        parseScore: parsed.parseScore,
        parsedAt: new Date(),
      }
    });
    count++;
    if (count % 10 === 0) console.log(`Processed ${count}...`);
  }

  console.log(`Reparse complete! Processed ${count} listings.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
