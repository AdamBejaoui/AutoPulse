import { prisma } from "../lib/prisma";
import { enrichListingLocally } from "../lib/scrapers/localFacebook";
import * as fs from "fs";
import * as path from "path";

// Zero-dependency env loader
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join("=").trim();
      }
    });
  }
}

loadEnv();

async function startNativeBackfill() {
  console.log("🛠️ STARTING NATIVE ENRICHMENT BOT (Phase 2)...");

  while (true) {
    // 1. Find the oldest 10 listings that need enrichment
    const missing = await prisma.listing.findMany({
      where: {
        OR: [
          { description: null },
          { description: { startsWith: "Waiting" } },
          { imageUrl: null }
        ]
      },
      orderBy: { createdAt: 'desc' }, // Prioritize newest findings
      take: 10
    });

    if (missing.length === 0) {
      console.log("✨ All listings enriched! Waiting 30 seconds for new discoveries...");
      await new Promise(r => setTimeout(r, 30000));
      continue;
    }

    console.log(`[native-enrichment] Found ${missing.length} items to process.`);

    for (const listing of missing) {
      try {
        const enriched = await enrichListingLocally(listing.listingUrl);
        
        if (enriched) {
          await prisma.listing.update({
            where: { id: listing.id },
            data: {
              description: enriched.description || "No description provided.",
              imageUrl: enriched.imageUrl || listing.imageUrl, // Keep old one if new fails
              updatedAt: new Date()
            }
          });
          console.log(`✅ Enriched: ${listing.externalId}`);
        }
      } catch (err) {
        console.error(`❌ Failed to enrich ${listing.externalId}:`, err);
      }
      
      // Small delay between enrichment to be stealthy
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

startNativeBackfill().catch(console.error);
