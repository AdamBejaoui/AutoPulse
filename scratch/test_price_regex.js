function parseRawMoneyToken(rawToken, hasK) {
  const raw = rawToken.replace(/[\s\u00A0,]/g, "");
  let dollars = Number(raw);
  if (!Number.isFinite(dollars) || dollars <= 0) return 0;
  if (hasK) dollars *= 1000;
  return dollars;
}

function parseTilePriceToCents(text) {
  if (!text) return 0;
  const cleanText = text.replace(/\u00A0/g, " ");
  const candidates = [];

  // Pattern 1: $1,234 (Prefix)
  const symbolRegex = /([\$£€])\s*([\d\s,]+)(?:\s*([kK]))?/g;
  for (const m of cleanText.matchAll(symbolRegex)) {
    const symbol = m[1];
    const val = parseRawMoneyToken(m[2] || "", Boolean(m[3]));
    let multiplier = 1.0;
    if (symbol === "£") multiplier = 1.27;
    if (symbol === "€") multiplier = 1.08;
    if (val >= 1 && val < 500000) candidates.push({ val, multiplier, source: 'prefix' });
  }

  // Pattern 2: 1 234 $US (Suffix)
  const suffixRegex = /([\d\s,]+)\s*(?:\$|USD|\$US|£|£GB|€|EUR)(?:\s*([kK]))?/gi;
  for (const m of cleanText.matchAll(suffixRegex)) {
    const fullMatch = m[0].toUpperCase();
    const val = parseRawMoneyToken(m[1] || "", Boolean(m[2]));
    let multiplier = 1.0;
    if (fullMatch.includes("£") || fullMatch.includes("GBP")) multiplier = 1.27;
    if (fullMatch.includes("€") || fullMatch.includes("EUR")) multiplier = 1.08;
    if (val >= 1 && val < 500000) candidates.push({ val, multiplier, source: 'suffix' });
  }

  if (/free/i.test(cleanText) && candidates.length === 0) return 0;
  if (candidates.length === 0) return 0;
  
  const nonYearCandidates = candidates.filter(c => c.val < 1900 || c.val > 2100);
  const best = nonYearCandidates.length > 0 ? nonYearCandidates[0] : candidates[0];
  
  return { cents: Math.round(best.val * best.multiplier * 100), source: best.source };
}

const userText = "4 500 $US1994 Chevrolet 1500 regular cabWaianae, HI169 K miles";
console.log("Original Text:", userText);
const res1 = parseTilePriceToCents(userText);
console.log("Result:", res1);

const userText2 = "3500 $2010 Honda Civic";
console.log("\nText 2:", userText2);
const res2 = parseTilePriceToCents(userText2);
console.log("Result:", res2);
