import { PrismaClient } from "@prisma/client";
import { parseListingText } from "../lib/parser/listingParser";

const prisma = new PrismaClient();

async function main() {
  console.log("[reparse-details] Starting full detail recovery for existing listings...");
  
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      rawTitle: true,
      rawDescription: true,
      description: true
    }
  });

  console.log(`[reparse-details] Processing ${listings.length} listings...`);

  let updatedCount = 0;
  for (const listing of listings) {
    const title = listing.rawTitle || "";
    const description = listing.rawDescription || listing.description || "";
    
    // Use rawTitle and the best available description
    const parsed = parseListingText(title, description);


    // Only update if we found something significant (like a year or make)
    if (parsed.year > 0 || parsed.make !== "Unknown") {
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          make: parsed.make,
          model: parsed.model,
          year: parsed.year,
          mileage: parsed.mileage,
          transmission: parsed.transmission,
          bodyStyle: parsed.bodyStyle,
          fuelType: parsed.fuelType,
          driveType: parsed.driveType,
          color: parsed.color,
          condition: parsed.condition,
          titleStatus: parsed.titleStatus,
          // We can also update fields like parseScore if needed
        }
      });
      updatedCount++;
    }
  }

  console.log(`[reparse-details] Success! Updated details for ${updatedCount} listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
