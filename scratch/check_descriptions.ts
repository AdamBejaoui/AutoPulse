
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main() {
  const listingWithDesc = await prisma.listing.findFirst({
    where: {
      AND: [
        { description: { not: null } },
        { description: { not: "" } }
      ]
    }
  });

  if (listingWithDesc) {
    console.log("✅ Found listing with description:");
    console.log("ID:", listingWithDesc.id);
    console.log("Title:", listingWithDesc.rawTitle);
    console.log("Description Length:", listingWithDesc.description?.length);
    console.log("Excerpt:", listingWithDesc.description?.substring(0, 200));
  } else {
    console.log("❌ No listings with descriptions found in the database.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
