import { Listing, Prisma, Subscription } from "@prisma/client";
import { newListingsEmail, sendMail, MailListing } from "./mailer";

/**
 * Finds all active subscriptions that match a given listing's attributes.
 */
export async function findMatchingSubscriptions(listing: Listing): Promise<Subscription[]> {
  const { prisma } = await import("./db");

  // --- PERFECT CAR-ONLY FILTER ---
  // Rely on the database-backed 'isCar' and 'isJunk' flags set by the AI parser.
  if (listing.isJunk || !listing.isCar) {
    console.log(`[alertMatcher] Filtering out non-car or junk: ${listing.rawTitle} (isJunk: ${listing.isJunk}, isCar: ${listing.isCar})`);
    return [];
  }
  // ------------------------------------

  const where: Prisma.SubscriptionWhereInput = {
    AND: [
      {
        OR: [
          { make: null },
          { make: { equals: listing.make?.trim(), mode: 'insensitive' } },
        ]
      },
      {
        OR: [
          { model: null },
          { model: { equals: listing.model?.trim(), mode: 'insensitive' } },
        ]
      },
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
          { mileageMin: null },
          { mileageMin: { lte: listing.mileage ?? 0 } }
        ]
      },
      {
        OR: [
          { mileageMax: null },
          { mileageMax: { gte: listing.mileage ?? 9999999 } }
        ]
      },
      {
        OR: [
          { city: null },
          { city: { equals: listing.city ?? '', mode: 'insensitive' } },
        ]
      },
      // === NEW ADVANCED FILTERS ===
      {
        OR: [
          { transmission: null },
          { transmission: { equals: listing.transmission ?? '___UNKNOWN___', mode: 'insensitive' } }
        ]
      },
      {
        OR: [
          { bodyStyle: null },
          { bodyStyle: { equals: listing.bodyStyle ?? '___UNKNOWN___', mode: 'insensitive' } }
        ]
      },
      {
        OR: [
          { driveType: null },
          { driveType: { equals: listing.driveType ?? '___UNKNOWN___', mode: 'insensitive' } }
        ]
      },
      {
        OR: [
          { titleStatus: null },
          { titleStatus: { equals: listing.titleStatus ?? '___UNKNOWN___', mode: 'insensitive' } }
        ]
      },
      {
        OR: [
          { fuelType: null },
          { fuelType: { equals: listing.fuelType ?? '___UNKNOWN___', mode: 'insensitive' } }
        ]
      }
    ]
  };

  // Accident Filter
  if (listing.accidents === true && Array.isArray(where.AND)) {
    // If car HAS accidents, user MUST NOT have noAccidents: true
    where.AND.push({
      OR: [
        { noAccidents: null },
        { noAccidents: false }
      ]
    });
  }

  // Owners Filter
  if (listing.owners && listing.owners > 0 && Array.isArray(where.AND)) {
    where.AND.push({
      OR: [
        { maxOwners: null },
        { maxOwners: { gte: listing.owners } }
      ]
    });
  }

  return await prisma.subscription.findMany({ where });
}

/**
 * Orchestrates matching and alerting for a single new listing.
 */
export async function matchListingToSubscriptions(listing: Listing) {
  try {
    const { prisma } = await import("./db");
    const candidates = await findMatchingSubscriptions(listing);

    
    // Strict in-memory post-filtering to perfectly honor parameters & drop null gaps
    const matches = candidates.filter(sub => {
      // Mileage constraints
      if (sub.mileageMin != null && listing.mileage !== null && listing.mileage < sub.mileageMin) return false;
      if (sub.mileageMax != null && listing.mileage !== null && listing.mileage > sub.mileageMax) return false;
      
      // Price constraints (converting boundaries safely)
      if (sub.priceMin != null && listing.price < sub.priceMin) return false;
      if (sub.priceMax != null && listing.price > sub.priceMax) return false;

      // Production Year constraints
      if (sub.yearMin != null && listing.year < sub.yearMin) return false;
      if (sub.yearMax != null && listing.year > sub.yearMax) return false;
      
      return true;
    });

    if (matches.length === 0) return;

    const mailListing: MailListing = {
      id: listing.id,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      price: listing.price,
      mileage: listing.mileage,
      city: listing.city,
      state: listing.state,
      imageUrls: listing.imageUrls,
      listingUrl: listing.listingUrl,
      // Add extra details for the email template
      trim: listing.trim || undefined,
      transmission: listing.transmission || undefined,
      condition: listing.condition || undefined
    };

    for (const sub of matches) {
      try {
        // Deduplication check using NotificationLog
        const alreadySent = await prisma.notificationLog.findUnique({
          where: {
            subscriptionId_listingId: {
              subscriptionId: sub.id,
              listingId: listing.id
            }
          }
        });

        if (alreadySent) {
          console.log(`[alertMatcher] Email already sent to ${sub.email} for listing ${listing.id}. Skipping.`);
          continue;
        }

        const { subject, html } = newListingsEmail({
          email: sub.email,
          listings: [mailListing],
          filters: {
            make: sub.make || undefined,
            model: sub.model || undefined,
            yearMin: sub.yearMin || undefined,
            yearMax: sub.yearMax || undefined,
            priceMin: sub.priceMin || undefined,
            priceMax: sub.priceMax || undefined,
            mileageMin: sub.mileageMin || undefined,
            mileageMax: sub.mileageMax || undefined,
            city: sub.city || undefined,
          }
        });

        await sendMail({
          to: sub.email,
          subject,
          html
        });

        // Record the notification
        await prisma.notificationLog.create({
          data: {
            subscriptionId: sub.id,
            listingId: listing.id
          }
        });
        
        console.log(`[alertMatcher] Sent alert to ${sub.email} for ${listing.year} ${listing.make} ${listing.model}`);

        
        // Add 2-second delay to prevent email spam flags
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.error(`[alertMatcher] Failed to send email to ${sub.email}:`, err);
      }
    }
  } catch (err) {
    console.error(`[alertMatcher] Processing error:`, err);
  }
}

