import "../lib/envBootstrap";
import cron from "node-cron";
import { getNotificationsQueue, getScrapeQueue } from "../lib/queue";
import "../workers/scrapeWorker";
import "../workers/notificationWorker";
import "../workers/alertMatchWorker";

function logStartup(): void {
  const now = new Date();
  console.log("[workers] AutoPulse worker process started at", now.toISOString());
  console.log(
    "[workers] Scheduled: scrape 'scrapeAll' every 4 hours (0 */4 * * *)",
  );
  console.log(
    "[workers] Scheduled: notifications 'checkAlerts' every 15 minutes (*/15 * * * *)",
  );
  const nextQuarter = new Date(now);
  nextQuarter.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  if (nextQuarter <= now) {
    nextQuarter.setMinutes(nextQuarter.getMinutes() + 15);
  }
  console.log(
    "[workers] Next notification check (approx.):",
    nextQuarter.toISOString(),
  );
}

cron.schedule("0 */4 * * *", async () => {
  try {
    await getScrapeQueue().add("scrapeAll", {}, { priority: 1 });
    console.log("[workers] Cron: 4-hour sweep queued");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[workers] Failed to queue scrapeAll:", msg);
  }
});

cron.schedule("*/15 * * * *", async () => {
  try {
    await getNotificationsQueue().add("checkAlerts", {});
    console.log("[workers] Cron: checkAlerts job queued");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[workers] Failed to queue checkAlerts:", msg);
  }
});

logStartup();
