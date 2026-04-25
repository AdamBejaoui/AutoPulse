import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { parseListingText } from '../parser/listingParser';

const prisma = new PrismaClient();

export async function enrichListingDetails(listingId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || !listing.listingUrl) return null;

  console.log(`📡 Deep scanning car: ${listing.rawTitle}...`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(listing.listingUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for FB's slow loading

    const content = await page.content();
    
    // Extract description
    const description = await page.evaluate(() => {
        // Facebook's description is usually in a span with lots of text
        const spans = Array.from(document.querySelectorAll('span'));
        const descSpan = spans.find(s => s.textContent && s.textContent.length > 200 && !s.textContent.includes(' Marketplace'));
        return descSpan ? descSpan.textContent : '';
    });

    const parsed = parseListingText(listing.rawTitle || '', description || '');

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        description: description || listing.description,
        make: parsed.make !== "Unknown" ? parsed.make : listing.make,
        model: parsed.model !== "Unknown" ? parsed.model : listing.model,
        year: parsed.year > 0 ? parsed.year : listing.year,
        mileage: parsed.mileage || listing.mileage,
        transmission: parsed.transmission || listing.transmission,
        trim: parsed.trim || listing.trim,
        isCar: !parsed.isJunk,
        parsedAt: new Date(),
      }
    });

    return updated;
  } catch (err) {
    console.error(`Failed to enrich ${listingId}:`, err);
    return null;
  } finally {
    await browser.close();
  }
}
