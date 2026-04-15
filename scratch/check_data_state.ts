
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main() {
  const subs = await prisma.subscription.findMany();
  const listingsCount = await prisma.listing.count();
  const recentListings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });

  console.log("=== DATA STATE ===");
  console.log(`Total Subscriptions: ${subs.length}`);
  subs.forEach((s, i) => {
    console.log(`Sub ${i+1}: ${s.email} | ${s.make} ${s.model || ""} | ${s.city || "Any City"}`);
  });
  console.log(`Total Listings: ${listingsCount}`);
  console.log("Recent Listings:");
  recentListings.forEach(l => {
    console.log(`- ${l.year} ${l.make} ${l.model} | $${l.price/100} | ${l.city} | Created: ${l.createdAt}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
