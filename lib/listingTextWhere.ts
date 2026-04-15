import type { Prisma } from "@prisma/client";
import { expandSearchTerms, splitKeywordPhrase } from "./searchSynonyms";

export type SmartTextParams = {
  keywords?: string | undefined;
  make?: string | undefined;
  model?: string | undefined;
  city?: string | undefined;
};

const MIN_TOKEN_LEN = 2;

/** One search token: match any variant across make, model, or description. */
export function vehicleTokenWhere(term: string): Prisma.ListingWhereInput {
  const trimmed = term.trim();
  if (trimmed.length < MIN_TOKEN_LEN) {
    return { id: { in: [] } };
  }
  const variants = expandSearchTerms(trimmed);
  const ors: Prisma.ListingWhereInput[] = [];
  for (const v of variants) {
    ors.push(
      { make: { contains: v, mode: "insensitive" } },
      { model: { contains: v, mode: "insensitive" } },
      { description: { contains: v, mode: "insensitive" } },
    );
  }
  return { OR: ors };
}

export function cityTokenWhere(term: string): Prisma.ListingWhereInput {
  const trimmed = term.trim();
  if (trimmed.length < MIN_TOKEN_LEN) {
    return { id: { in: [] } };
  }

  // Smart check for "City, ST" format (e.g. "Houston, TX")
  if (trimmed.includes(",")) {
    const parts = trimmed.split(",").map((p) => p.trim());
    const cityPart = parts[0];
    const statePart = parts[1];
    
    if (cityPart && statePart) {
      return {
        AND: [
          { city: { contains: cityPart, mode: "insensitive" } },
          {
            OR: [
              { state: { contains: statePart, mode: "insensitive" } },
              { state: { equals: null } },
              { state: { equals: "" } },
            ],
          },
        ],
      };
    }

  }

  const variants = expandSearchTerms(trimmed);
  const ors: Prisma.ListingWhereInput[] = [];
  for (const v of variants) {
    ors.push(
      { city: { contains: v, mode: "insensitive" } },
      { state: { contains: v, mode: "insensitive" } },
    );
  }
  return { OR: ors };
}


/**
 * Smart text filters: keywords (multi-word AND), make, model, city.
 * Make/model each search across make+model+description so messy FB titles still match.
 */
export function smartTextWhereFromParams(
  p: SmartTextParams,
): Prisma.ListingWhereInput | undefined {
  const and: Prisma.ListingWhereInput[] = [];

  if (p.keywords) {
    for (const w of splitKeywordPhrase(p.keywords)) {
      if (w.length < MIN_TOKEN_LEN) continue;
      and.push(vehicleTokenWhere(w));
    }
  }
  if (p.make && p.make.trim().length >= MIN_TOKEN_LEN) {
    and.push(vehicleTokenWhere(p.make.trim()));
  }
  if (p.model && p.model.trim().length >= MIN_TOKEN_LEN) {
    and.push(vehicleTokenWhere(p.model.trim()));
  }
  if (p.city && p.city.trim().length >= MIN_TOKEN_LEN) {
    and.push(cityTokenWhere(p.city.trim()));
  }

  if (and.length === 0) return undefined;
  if (and.length === 1) return and[0];
  return { AND: and };
}
