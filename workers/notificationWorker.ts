import "../lib/envBootstrap";
import { Worker } from "bullmq";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getRedisConnection } from "../lib/queue";
import { newListingsEmail, sendMail, type AlertFilters } from "../lib/mailer";
import { cityTokenWhere, vehicleTokenWhere } from "../lib/listingTextWhere";

const connection = getRedisConnection().duplicate();

function buildListingWhere(sub: {
  lastCheckedAt: Date | null;
  make: string | null;
  model: string | null;
  yearMin: number | null;
  yearMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  mileageMax: number | null;
  city: string | null;
  // New fields
  trim?: string | null;
  bodyStyle?: string | null;
  driveType?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  color?: string | null;
  titleStatus?: string | null;
  maxOwners?: number | null;
  noAccidents?: boolean | null;
  requiredFeatures?: string[];
}): Prisma.ListingWhereInput {
  const since =
    sub.lastCheckedAt ?? new Date(Date.now() - 24 * 60 * 60 * 1000);

  const parts: Prisma.ListingWhereInput[] = [{ createdAt: { gt: since } }];

  if (sub.make && sub.make.trim().length >= 2) {
    parts.push(vehicleTokenWhere(sub.make));
  }
  if (sub.model && sub.model.trim().length >= 2) {
    parts.push(vehicleTokenWhere(sub.model));
  }
  if (sub.city && sub.city.trim().length >= 2) {
    parts.push(cityTokenWhere(sub.city));
  }

  if (sub.yearMin != null || sub.yearMax != null) {
    const year: Prisma.IntFilter = {};
    if (sub.yearMin != null) year.gte = sub.yearMin;
    if (sub.yearMax != null) year.lte = sub.yearMax;
    parts.push({ year });
  }
  if (sub.priceMin != null || sub.priceMax != null) {
    const price: Prisma.IntFilter = {};
    if (sub.priceMin != null) price.gte = sub.priceMin;
    if (sub.priceMax != null) price.lte = sub.priceMax;
    parts.push({ price });
  }
  if (sub.mileageMax != null) {
    parts.push({
      OR: [{ mileage: { lte: sub.mileageMax } }, { mileage: null }],
    });
  }

  // --- NEW STRUCTURED MATCHES ---
  if (sub.trim) parts.push({ trim: { contains: sub.trim, mode: "insensitive" } });
  if (sub.bodyStyle) parts.push({ bodyStyle: sub.bodyStyle });
  if (sub.driveType) parts.push({ driveType: sub.driveType });
  if (sub.transmission) parts.push({ transmission: sub.transmission });
  if (sub.fuelType) parts.push({ fuelType: sub.fuelType });
  if (sub.color) parts.push({ color: sub.color });
  if (sub.titleStatus) parts.push({ titleStatus: sub.titleStatus });
  if (sub.maxOwners != null) parts.push({ OR: [{ owners: { lte: sub.maxOwners } }, { owners: null }] });
  if (sub.noAccidents) parts.push({ OR: [{ accidents: false }, { accidents: null }] });
  if (sub.requiredFeatures && sub.requiredFeatures.length > 0) {
    parts.push({ features: { hasEvery: sub.requiredFeatures } });
  }

  return { AND: parts };
}

function subscriptionToFilters(sub: {
  make: string | null;
  model: string | null;
  yearMin: number | null;
  yearMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  mileageMax: number | null;
  city: string | null;
}): AlertFilters {
  return {
    make: sub.make ?? undefined,
    model: sub.model ?? undefined,
    yearMin: sub.yearMin ?? undefined,
    yearMax: sub.yearMax ?? undefined,
    priceMin: sub.priceMin ?? undefined,
    priceMax: sub.priceMax ?? undefined,
    mileageMax: sub.mileageMax ?? undefined,
    city: sub.city ?? undefined,
  };
}

export const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    if (job.name !== "checkAlerts") return;

    let checked = 0;
    let sent = 0;

    try {
      const subscriptions = await prisma.subscription.findMany();

      for (const sub of subscriptions) {
        checked += 1;
        try {
          const where = buildListingWhere(sub);
          const totalMatching = await prisma.listing.count({ where });
          const listings = await prisma.listing.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 10,
          });

          if (listings.length === 0) continue;

          const { subject, html } = newListingsEmail({
            email: sub.email,
            listings,
            filters: subscriptionToFilters(sub),
            totalMatching,
          });

          await sendMail({ to: sub.email, subject, html });

          await prisma.subscription.update({
            where: { id: sub.id },
            data: { lastCheckedAt: new Date() },
          });

          sent += 1;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error(
            `[notificationWorker] Subscription ${sub.id} failed: ${msg}`,
          );
        }
      }

      console.log(
        `[notificationWorker] Checked ${checked} subscriptions, sent ${sent} alerts`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[notificationWorker] checkAlerts failed: ${msg}`);
      throw e;
    }
  },
  {
    connection,
    concurrency: 1,
  },
);

notificationWorker.on("failed", (job, err) => {
  console.error(
    `[notificationWorker] Job ${job?.id} (${job?.name}) failed:`,
    err?.message ?? err,
  );
});
