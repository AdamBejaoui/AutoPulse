import "../lib/envBootstrap";
import { Worker } from "bullmq";
import { prisma } from "../lib/prisma";
import { getRedisConnection } from "../lib/queue";
import { parseListingText } from "../lib/parser/listingParser";

const connection = getRedisConnection().duplicate();

export const reparseWorker = new Worker(
  "reparse",
  async (job) => {
    if (job.name !== "reparseAll") return;

    let processed = 0;
    let errors = 0;

    try {
      // Find all listings that haven't been parsed yet
      const listings = await prisma.listing.findMany({
        where: { parsedAt: null },
        take: 500, // Process in batches
      });

      for (const listing of listings) {
        try {
          const parsed = parseListingText(listing.rawTitle || listing.make + " " + listing.model, listing.description || "");
          
          await prisma.listing.update({
            where: { id: listing.id },
            data: {
              trim: parsed.trim,
              bodyStyle: parsed.bodyStyle,
              driveType: parsed.driveType,
              engine: parsed.engine,
              transmission: parsed.transmission,
              fuelType: parsed.fuelType,
              color: parsed.color,
              doors: parsed.doors,
              titleStatus: parsed.titleStatus,
              condition: parsed.condition,
              accidents: parsed.accidents,
              owners: parsed.owners,
              features: parsed.features,
              parseScore: parsed.parseScore,
              parsedAt: new Date(),
            }
          });
          processed++;
        } catch (e) {
          errors++;
          console.error(`[reparseWorker] Failed on listing ${listing.id}:`, e);
        }
      }

      return { processed, errors };
    } catch (e) {
      console.error("[reparseWorker] Job failed:", e);
      throw e;
    }
  },
  {
    connection,
    concurrency: 1,
  }
);
