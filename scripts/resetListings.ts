import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main(): Promise<void> {
  const before = await prisma.listing.count();
  await prisma.listing.deleteMany({});
  const after = await prisma.listing.count();
  console.log(`[resetListings] before=${before} after=${after}`);
}

main()
  .catch((err) => {
    console.error("[resetListings] failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
