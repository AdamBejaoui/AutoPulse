import "../lib/envBootstrap";
import { Worker } from "bullmq";
import { getRedisConnection } from "../lib/queue";
import { runAllScrapers } from "../lib/scrapers/index";

const connection = getRedisConnection().duplicate();

export const scrapeWorker = new Worker(
  "scrape",
  async (job) => {
    if (job.name === "scrapeAll") {
      try {
        const summary = await runAllScrapers();
        console.log(
          `[scrapeWorker] scrapeAll complete: scraped=${summary.totalScraped} upserted=${summary.totalUpserted} errors=${summary.totalErrors}`,
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[scrapeWorker] scrapeAll error: ${msg}`);
        throw e;
      }
    }
  },
  {
    connection,
    concurrency: 1,
  },
);

scrapeWorker.on("failed", (job, err) => {
  console.error(
    `[scrapeWorker] Job ${job?.id} (${job?.name}) failed:`,
    err?.message ?? err,
  );
});
