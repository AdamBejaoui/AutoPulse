/**
 * Common misspellings / shorthands → canonical strings to also match in search.
 * Keys must be lowercase; lookup uses lowercase input.
 */
export const VEHICLE_SEARCH_SYNONYMS: Readonly<
  Record<string, readonly string[]>
> = {
  porsh: ["porsche"],
  porche: ["porsche"],
  porsch: ["porsche"],
  chevy: ["chevrolet"],
  chev: ["chevrolet"],
  vw: ["volkswagen"],
  merc: ["mercedes", "mercedes-benz"],
  mb: ["mercedes", "mercedes-benz"],
  infinity: ["infiniti"],
  infinti: ["infiniti"],
  caddy: ["cadillac"],
  range: ["range rover", "land rover"],
  rover: ["land rover", "range rover"],
  rolls: ["rolls-royce", "rolls royce"],
  subie: ["subaru"],
  mitsu: ["mitsubishi"],
  mazda: ["mazda"],
  hyundai: ["hyundai"],
  hyndai: ["hyundai"],
  kia: ["kia"],
  nissan: ["nissan"],
  toyota: ["toyota"],
  honda: ["honda"],
  ford: ["ford"],
  dodge: ["dodge"],
  jeep: ["jeep"],
  gmc: ["gmc"],
  audi: ["audi"],
  bmw: ["bmw"],
  lexus: ["lexus"],
  acura: ["acura"],
  volvo: ["volvo"],
  jag: ["jaguar"],
  jaguar: ["jaguar"],
  alfa: ["alfa romeo", "alfa"],
  mini: ["mini"],
  fiat: ["fiat"],
  tesla: ["tesla"],
  rivian: ["rivian"],
  lucid: ["lucid"],
  genesis: ["genesis"],
};

export function expandSearchTerms(term: string): readonly string[] {
  const t = term.trim();
  if (!t) return [];
  const lower = t.toLowerCase();
  const out = new Set<string>([t]);
  const extra = VEHICLE_SEARCH_SYNONYMS[lower];
  if (extra) {
    for (const e of extra) {
      out.add(e);
    }
  }
  return [...out];
}

export function splitKeywordPhrase(phrase: string): string[] {
  return phrase
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}
