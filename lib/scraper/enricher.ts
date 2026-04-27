import { prisma } from '../db';
import { parseListingText } from '../parser/listingParser';

export async function enrichListingDetails(listingId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || !listing.listingUrl) return null;

  console.log(`📡 Deep scanning car: ${listing.rawTitle}...`);
  
  try {
    if (!listing.listingUrl || listing.listingUrl === "none" || listing.listingUrl.trim() === "") {
      console.log(`⚠️ Skipping enrichment for ${listing.id}: missing or invalid URL`);
      return false;
    }
    let browser;
    try {
        const { chromium } = await import('playwright');
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });
        
        // Load stored Facebook cookies to bypass login wall
        const session = await prisma.scraperSession.findUnique({ where: { id: 'facebook-default' } });
        if (session && session.cookies) {
            await context.addCookies(session.cookies as any);
        }
        
        const page = await context.newPage();
        
        await page.goto(listing.listingUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Extract title
        let scrapedTitle = await page.title();
        scrapedTitle = scrapedTitle.replace(/\s*\|\s*Facebook/i, '').trim();
        if (!scrapedTitle || scrapedTitle.toLowerCase().includes('marketplace') || scrapedTitle.toLowerCase() === 'facebook') {
            scrapedTitle = listing.rawTitle || '';
        }

        // Extract description
        const metaDesc = await page.evaluate(() => {
            const el = document.querySelector('meta[name="description"], meta[property="og:description"]');
            return el ? el.getAttribute('content') || '' : '';
        });

        // Extract body text
        const cleanBodyText = await page.evaluate(() => {
            return document.body ? document.body.innerText.substring(0, 50000) : '';
        });
        
        await browser.close();

    const description = `${metaDesc}\n\n--- FULL PAGE SPECS ---\n\n${cleanBodyText.substring(0, 50000)}`;

    const parsed = parseListingText(scrapedTitle || listing.rawTitle || '', description);

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        rawTitle: scrapedTitle || listing.rawTitle,
        description: metaDesc || listing.description, // Only save the clean meta desc to avoid bloating DB
        make: parsed.make !== "Unknown" ? parsed.make : listing.make,
        model: parsed.model !== "Unknown" ? parsed.model : listing.model,
        year: parsed.year > 0 ? parsed.year : listing.year,
        mileage: parsed.mileage || listing.mileage,
        transmission: parsed.transmission || listing.transmission,
        trim: parsed.trim || listing.trim,
        
        // Save the expanded specs
        bodyStyle: parsed.bodyStyle || listing.bodyStyle,
        driveType: parsed.driveType || listing.driveType,
        engine: parsed.engine || listing.engine,
        fuelType: parsed.fuelType || listing.fuelType,
        color: parsed.color || listing.color,
        doors: parsed.doors || listing.doors,
        titleStatus: parsed.titleStatus || listing.titleStatus,
        condition: parsed.condition || listing.condition,
        accidents: parsed.accidents !== null ? parsed.accidents : listing.accidents,
        owners: parsed.owners || listing.owners,
        features: parsed.features && parsed.features.length > 0 ? parsed.features : listing.features,
        
        parseScore: parsed.parseScore,
        parsedAt: new Date(),
      }
    });

    return updated;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} catch (err) {
  console.error(`Failed to enrich ${listingId}:`, err);
  return null;
}
}
