import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { getScrapeQueue } = await import("@/lib/queue");
    await getScrapeQueue().add("scrapeAll", {}, { priority: 1 });
    return NextResponse.json({
      queued: true,
      message: "Scrape job added to queue",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to queue scrape job";
    console.error("[api/scrape/trigger]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
