import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";
import { MARKETPLACE_CITIES } from "../lib/cities";

const cityBySlug = new Map(
  MARKETPLACE_CITIES.map((c) => {
    const [city, state] = c.label.split(",").map((x) => x.trim());
    return [c.slug, { city, state: state || null }];
  }),
);

async function main(): Promise<void> {
  const candidates = await prisma.listing.findMany({
    where: {},
    select: {
      id: true,
      city: true,
      state: true,
      listingUrl: true,
    },
    take: 20000,
  });

  let fixed = 0;
  for (const row of candidates) {
    const cityKey = (row.city || "").trim().toLowerCase().replace(/\s+/g, "-");
    const m = row.listingUrl.match(/marketplace\/([^/]+)\//i);
    const slug = (m?.[1] || cityKey).toLowerCase();
    const mapped = cityBySlug.get(slug);
    if (!mapped) continue;

    const currentCity = (row.city || "").trim();
    const lowerCity = currentCity.toLowerCase();
    const looksLikeSlug = lowerCity === slug || lowerCity.replace(/\s+/g, "-") === slug;
    const shouldFixCity =
      !currentCity ||
      currentCity.includes("-") ||
      looksLikeSlug;
    const shouldFixState =
      !row.state ||
      (looksLikeSlug && row.state.trim().length !== 2);
    if (!shouldFixCity && !shouldFixState) continue;

    await prisma.listing.update({
      where: { id: row.id },
      data: {
        city: shouldFixCity ? mapped.city : undefined,
        state: shouldFixState ? mapped.state : undefined,
      },
    });
    fixed += 1;
  }

  console.log(`[repairListingLocations] candidates=${candidates.length} fixed=${fixed}`);
}

main()
  .catch((err) => {
    console.error("[repairListingLocations] failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
