import { Listing, Prisma, Subscription } from "@prisma/client";
import { prisma } from "./prisma";
import { vehicleTokenWhere, cityTokenWhere } from "./listingTextWhere";

/**
 * Finds all active subscriptions that match a given listing's attributes.
 */
export async function findMatchingSubscriptions(listing: Listing): Promise<Subscription[]> {
  // We want to find subscriptions where:
  // (sub.make is null OR sub.make == listing.make) AND
  // (sub.model is null OR sub.model == listing.model) AND
  // (sub.yearMin is null OR listing.year >= sub.yearMin) AND ...
  
  const where: Prisma.SubscriptionWhereInput = {
    AND: [
      // Make/Model matching (Case insensitive contains or exact)
      {
        OR: [
          { make: null },
          { make: { equals: listing.make, mode: 'insensitive' } },
        ]
      },
      {
        OR: [
          { model: null },
          { model: { equals: listing.model, mode: 'insensitive' } },
        ]
      },
      // Numeric ranges
      {
        OR: [
          { yearMin: null },
          { yearMin: { lte: listing.year } }
        ]
      },
      {
        OR: [
          { yearMax: null },
          { yearMax: { gte: listing.year } }
        ]
      },
      {
        OR: [
          { priceMin: null },
          { priceMin: { lte: listing.price } }
        ]
      },
      {
        OR: [
          { priceMax: null },
          { priceMax: { gte: listing.price } }
        ]
      },
      {
        OR: [
          { mileageMax: null },
          { mileageMax: { gte: listing.mileage ?? 9999999 } }
        ]
      },
      // City matching
      {
        OR: [
          { city: null },
          { city: { equals: listing.city ?? '', mode: 'insensitive' } },
        ]
      },
      // Advanced Filters
      {
        OR: [
          { titleStatus: null },
          { titleStatus: { equals: listing.titleStatus ?? '', mode: 'insensitive' } }
        ]
      },
      {
        OR: [
          { transmission: null },
          { transmission: { equals: listing.transmission ?? '', mode: 'insensitive' } }
        ]
      },
      {
        OR: [
          { fuelType: null },
          { fuelType: { equals: listing.fuelType ?? '', mode: 'insensitive' } }
        ]
      },
      {
        OR: [
          { color: null },
          { color: { equals: listing.color ?? '', mode: 'insensitive' } }
        ]
      },
      {
        OR: [
          { bodyStyle: null },
          { bodyStyle: { equals: listing.bodyStyle ?? '', mode: 'insensitive' } }
        ]
      },
      {
        OR: [
          { driveType: null },
          { driveType: { equals: listing.driveType ?? '', mode: 'insensitive' } }
        ]
      }
    ]
  };

  const matches = await prisma.subscription.findMany({ where });

  // Post-filtering for keywords (until Prisma supports array-to-string overlaps natively)
  return matches.filter(sub => {
    if (!sub.keywords || sub.keywords.length === 0) return true;
    
    const searchText = `${listing.rawTitle} ${listing.rawDescription}`.toLowerCase();
    return sub.keywords.some(kw => searchText.includes(kw.toLowerCase()));
  });
}
