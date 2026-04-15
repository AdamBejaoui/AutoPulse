
import "../lib/envBootstrap";
import { getNotificationsQueue } from "../lib/queue";

async function main() {
  console.log("Triggering notification check (checkAlerts)...");
  const queue = getNotificationsQueue();
  const job = await queue.add("checkAlerts", { forced: true });
  console.log(`Job queued successfully! Job ID: ${job.id}`);
  process.exit(0);
}

main().catch(err => {
  console.error("Failed to trigger check:", err);
  process.exit(1);
});
