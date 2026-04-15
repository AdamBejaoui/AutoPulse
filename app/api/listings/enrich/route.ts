import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichListingLocally } from "@/lib/scrapers/localFacebook";
import { parseListingText } from "@/lib/parser/listingParser";

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (String(e).includes("ETIMEDOUT") || String(e).includes("connection")) {
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

// Track syncing IDs to prevent duplicate browsers for the same car
const currentlySyncing = new Set<string>();
let activeRequests = 0;
const MAX_CONCURRENT = 10;
let lastReset = Date.now();

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { listingId } = body;
  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  // Safety Reset: If we've been pegged at max for > 30 seconds, something might be stuck.
  if (activeRequests >= MAX_CONCURRENT && Date.now() - lastReset > 30000) {
    console.warn(`[API/Enrich] Safety Reset: Counter stuck at ${activeRequests}. Resetting.`);
    activeRequests = 0;
    currentlySyncing.clear();
    lastReset = Date.now();
  }

  if (currentlySyncing.has(listingId)) {
    console.log(`[API/Enrich] Already syncing ${listingId}. Returning 202.`);
    return NextResponse.json({ message: "Already syncing this car", code: "IN_PROGRESS" }, { status: 202 });
  }

  if (activeRequests >= MAX_CONCURRENT) {
    console.log(`[API/Enrich] Busy: ${activeRequests} active. Slots taken by:`, Array.from(currentlySyncing));
    return NextResponse.json({ error: "Server Busy", code: "BUSY" }, { status: 503 });
  }

  activeRequests++;
  currentlySyncing.add(listingId);
  lastReset = Date.now(); // Update timestamp on successful start

  try {
    const listing = await withRetry(() => prisma.listing.findUnique({
      where: { id: listingId },
    }));

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Only enrich if it hasn't been enriched yet OR if it's a fallback
    const isFallback = listing.rawDescription?.includes("AutoPulse local capture") || !listing.condition;

    if (!isFallback) {
      return NextResponse.json({ listing });
    }

    console.log(`[API/Enrich] Scrape started (${activeRequests} active): ${listing.rawTitle}`);

    // Race the scraper against a 40-second timeout
    const detailsPromise = enrichListingLocally(listing.listingUrl);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 40000));

    const details = await Promise.race([detailsPromise, timeoutPromise]) as any;

    if (!details) {
      return NextResponse.json({ error: "Enrichment failed (empty content)" }, { status: 500 });
    }

    // Parse the new full description to extract more metadata
    const parsed = parseListingText(details.detailTitle || listing.rawTitle || "", details.description || "");

    const updated = await withRetry(() => prisma.listing.update({
      where: { id: listingId },
      data: {
        rawDescription: details.description || listing.rawDescription,
        description: details.description || listing.description,
        condition: details.condition || listing.condition,
        make: parsed.make !== "Unknown" ? parsed.make : listing.make,
        model: parsed.model !== "Unknown" ? parsed.model : listing.model,
        year: parsed.year > 0 ? parsed.year : listing.year,
        mileage: parsed.mileage ?? listing.mileage,
        price: (details.priceCents && details.priceCents > 0) ? details.priceCents : listing.price,
        imageUrl: details.imageUrl || listing.imageUrl,
        postedAt: details.postedAt || listing.postedAt,
        city: details.city || listing.city,
        state: details.state || listing.state,
      },
    }));

    console.log(`[API/Enrich] Success: ${listing.rawTitle}`);
    return NextResponse.json({ listing: updated });

  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Internal error";
    console.error(`[API/Enrich] Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: msg === "Timeout" ? 504 : 500 });
  } finally {
    activeRequests--;
    currentlySyncing.delete(listingId);
    console.log(`[API/Enrich] Done ${listingId}. ${activeRequests} active.`);
  }
}
