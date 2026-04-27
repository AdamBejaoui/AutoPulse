import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import { parseListingText, isJunkTitle } from '../lib/parser/listingParser';
import { matchListingToSubscriptions } from '../lib/alertMatcher';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

const runId = process.argv[2] || 'z4XEhbycwZtcSmlIH';

async function processRun() {
  console.log('═══════════════════════════════════════');
  console.log(`   PROCESSING APIFY RUN: ${runId}`);
  console.log('═══════════════════════════════════════');

  try {
    const run = await apifyClient.run(runId).get();
    if (!run) {
      console.log(`❌ Run ${runId} not found.`);
      return;
    }

    if (run.status !== 'SUCCEEDED') {
      console.log(`⚠️ Run is in status: ${run.status}. Cannot process yet.`);
      return;
    }

    const dataset = await apifyClient.run(runId).dataset().listItems();
    console.log(`📊 Found ${dataset.items.length} items in dataset.`);

    let fixedCount = 0;

    for (const item of dataset.items) {
      try {
        const description = item.description || item.redacted_description?.text || '';
        const title = item.marketplace_listing_title || item.custom_title || item.title || '';
        
        // 1. Junk Filter
        if (isJunkTitle(title, description)) {
          console.log(`⏭️ Skipping junk title: ${title}`);
          continue;
        }

        const parsed = parseListingText(title, description);
        if (parsed.isJunk) {
          console.log(`⏭️ Skipping confirmed junk listing (parsed): ${title}`);
          continue;
        }

        // 2. ID and URL construction
        const externalId = (item.id || item.listingUrl?.match(/item\/(\d+)/)?.[1] || item.url?.match(/item\/(\d+)/)?.[1] || Math.random().toString()).toString();
        const listingUrl = externalId.match(/^\d+$/) 
          ? `https://www.facebook.com/marketplace/item/${externalId}/`
          : item.listingUrl || item.url || '';

        // 3. Price construction (Cents)
        const priceCents = item.listing_price?.amount 
          ? Math.round(parseFloat(item.listing_price.amount) * 100) 
          : (item.price ? Math.round(parseFloat(item.price) * 100) : 0);

        // 4. Image collection
        const imageUrls = [
          item.primary_listing_photo_url,
          ...(item.listing_photos?.map((p: any) => p.image?.uri || p.url) || []),
          ...(item.all_listing_photos?.map((p: any) => p.image?.uri) || []),
          ...(item.additional_photos?.map((p: any) => p.uri) || [])
        ].filter(Boolean);

        // 5. Apply Structured Fallbacks
        const mileage = parsed.mileage || item.vehicle_odometer_data?.value || null;
        const titleStatus = parsed.titleStatus || item.vehicle_title_status || null;
        const transmission = parsed.transmission || item.vehicle_transmission_type || null;
        const color = parsed.color || item.vehicle_exterior_color || item.vehicle_interior_color || null;
        const trim = parsed.trim || item.vehicle_trim_display_name || null;
        const vin = parsed.vin || item.vehicle_identification_number || null;

        const listingData = {
          externalId: externalId,
          source: 'facebook',
          rawTitle: title,
          description: description,
          listingUrl: listingUrl,
          price: priceCents,
          imageUrls: Array.from(new Set(imageUrls)),
          city: item.location_text?.text?.split(',')[0]?.trim() || item.city || null,
          state: item.location_text?.text?.split(',')[1]?.trim() || item.state || null,
          postedAt: item.creation_time ? new Date(item.creation_time * 1000) : new Date(),
          
          make: parsed.make,
          model: parsed.model,
          year: parsed.year,
          mileage: mileage,
          trim: trim,
          bodyStyle: parsed.bodyStyle,
          driveType: parsed.driveType,
          engine: parsed.engine,
          transmission: transmission,
          fuelType: parsed.fuelType,
          color: color,
          doors: parsed.doors,
          titleStatus: titleStatus,
          condition: parsed.condition,
          accidents: parsed.accidents,
          owners: parsed.owners,
          features: parsed.features,
          vin: vin,
          isJunk: parsed.isJunk,
          isCar: !parsed.isJunk && parsed.make !== "Unknown",
          parseScore: parsed.parseScore,
          parsedAt: new Date(),
        };

        // 6. Upsert into DB
        const listing = await prisma.listing.upsert({
          where: { externalId: externalId },
          update: listingData,
          create: listingData,
        });

        if (listing) {
          try {
            await matchListingToSubscriptions(listing);
          } catch (matchError) {
            console.error(`❌ Failed to match subscription for ${externalId}:`, matchError);
          }
        }

        console.log(`🔧 Fixed: ${title} — Mileage: ${mileage} mi, Title: ${titleStatus}, Trans: ${transmission}`);
        fixedCount++;
      } catch (itemError: any) {
        console.error(`❌ Error processing item ${item.id}:`, itemError.message);
      }
    }

    console.log(`\n✅ Finished! Successfully fixed ${fixedCount} listings.`);
  } catch (error: any) {
    console.error('❌ Failed to process run:', error.message);
  }

  await prisma.$disconnect();
}

processRun().catch(console.error);
