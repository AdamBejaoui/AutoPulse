import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

function parseRawMoneyToken(rawToken: string, hasK: boolean): number {
  const raw = rawToken.replace(/\s/g, "");
  let dollars = 0;
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(raw)) {
    dollars = Number(raw.replace(/[.,]/g, ""));
  } else {
    dollars = Number(raw.replace(/,/g, ""));
  }
  if (!Number.isFinite(dollars) || dollars <= 0) return 0;
  if (hasK) dollars *= 1000;
  return dollars;
}

function parsePriceFromTextToCents(text: string): number {
  const candidates: number[] = [];
  const dollarRegex = /\$\s*(\d[\d.,\s]*)(?:\s*([kK]))?/g;
  for (const m of text.matchAll(dollarRegex)) {
    const dollars = parseRawMoneyToken(m[1] || "", Boolean(m[2]));
    if (dollars >= 500 && dollars <= 300000) candidates.push(dollars);
  }
  const contextRegex =
    /\b(?:price|asking|obo|firm|usd)\b\s*[:\-]?\s*(\d[\d.,\s]*)(?:\s*([kK]))?/gi;
  for (const m of text.matchAll(contextRegex)) {
    const dollars = parseRawMoneyToken(m[1] || "", Boolean(m[2]));
    if (dollars >= 500 && dollars <= 300000) candidates.push(dollars);
  }
  if (candidates.length === 0) return 0;
  return Math.round(candidates[0]! * 100);
}

async function main(): Promise<void> {
  const rows = await prisma.listing.findMany({
    where: { price: { gt: 0, lt: 10000 } },
    select: { id: true, price: true, rawTitle: true, rawDescription: true },
    take: 2000,
  });

  let fixed = 0;
  for (const r of rows) {
    const parsed = parsePriceFromTextToCents(`${r.rawTitle || ""} ${r.rawDescription || ""}`);
    if (parsed > 0 && parsed >= r.price * 10) {
      await prisma.listing.update({
        where: { id: r.id },
        data: { price: parsed, updatedAt: new Date() },
      });
      fixed += 1;
    }
  }
  console.log(`[repairSuspiciousPrices] scanned=${rows.length} fixed=${fixed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
