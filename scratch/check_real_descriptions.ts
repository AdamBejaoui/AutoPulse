
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main() {
  const listings = await prisma.listing.findMany({
    where: {
      description: {
        not: {
          contains: "AutoPulse local capture"
        }
      }
    },
    take: 5
  });

  if (listings.length > 0) {
    console.log(`✅ Found ${listings.length} listings with potentially real descriptions:`);
    listings.forEach(l => {
        console.log(`- ID: ${l.id} | Desc Length: ${l.description?.length}`);
        console.log(`  Desc: ${l.description?.substring(0, 100)}...`);
    });
  } else {
    console.log("❌ No listings found with real descriptions (that don't have the fallback prefix).");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
