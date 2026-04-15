import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main(): Promise<void> {
  const total = await prisma.listing.count();
  const unknown = await prisma.listing.count({
    where: { OR: [{ make: "Unknown" }, { model: "Unknown" }] },
  });
  const rows = await prisma.listing.findMany({
    where: { OR: [{ make: "Unknown" }, { model: "Unknown" }] },
    select: {
      externalId: true,
      make: true,
      model: true,
      rawTitle: true,
      description: true,
      listingUrl: true,
      updatedAt: true,
    },
    take: 12,
    orderBy: { updatedAt: "desc" },
  });
  console.log(JSON.stringify({ total, unknown, rows }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
