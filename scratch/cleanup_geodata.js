const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Starting geodata cleanup...");
  const listings = await prisma.listing.findMany({
    where: {
      OR: [
        { state: null },
        { state: "" }
      ]
    },
    select: { id: true, city: true, rawTitle: true }
  });

  console.log(`Found ${listings.length} listings with missing state.`);

  let updated = 0;
  for (const l of listings) {
    if (!l.city) continue;
    
    // Simple heuristics for missing state
    let newState = null;
    const city = l.city.toLowerCase();
    
    if (city.includes("houston")) newState = "TX";
    if (city.includes("chicago")) newState = "IL";
    if (city.includes("new york")) newState = "NY";
    if (city.includes("los angeles")) newState = "CA";
    if (city.includes("san francisco")) newState = "CA";
    if (city.includes("phoenix")) newState = "AZ";
    if (city.includes("philadelphia")) newState = "PA";
    if (city.includes("san antonio")) newState = "TX";
    if (city.includes("san diego")) newState = "CA";
    if (city.includes("dallas")) newState = "TX";
    
    if (newState) {
      await prisma.listing.update({
        where: { id: l.id },
        data: { state: newState }
      });
      updated++;
    }
  }

  console.log(`Cleanup complete. Updated ${updated} listings.`);
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
