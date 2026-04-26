import { PrismaClient } from '@prisma/client';
import { parseListingText } from '../parser/listingParser';

const prisma = new PrismaClient();

export async function enrichListingDetails(listingId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || !listing.listingUrl) return null;

  console.log(`📡 Deep scanning car: ${listing.rawTitle}...`);
  
  try {
    if (!listing.listingUrl || listing.listingUrl === "none" || listing.listingUrl.trim() === "") {
      console.log(`⚠️ Skipping enrichment for ${listing.id}: missing or invalid URL`);
      return false;
    }
    
    // Use lightweight fetch instead of Playwright to avoid Vercel 500 errors
    const res = await fetch(listing.listingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    if (!res.ok) {
        console.error(`Fetch failed for ${listing.listingUrl}: ${res.status}`);
        return null;
    }

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    let rawPageTitle = titleMatch ? titleMatch[1] : '';
    let scrapedTitle = rawPageTitle.replace(/\s*\|\s*Facebook/i, '').trim();
    
    if (!scrapedTitle || scrapedTitle.toLowerCase().includes('marketplace') || scrapedTitle.toLowerCase() === 'facebook') {
        scrapedTitle = listing.rawTitle || '';
    }

    // Extract description meta tag
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/i) || 
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["'][^>]*>/i);
    const metaDesc = descMatch ? descMatch[1] : '';

    // Strip basic HTML tags for full text (to find mileage, features, etc)
    // We only take the body to avoid CSS/JS
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : html;
    
    // Remove script/style tags and then strip remaining HTML
    const cleanBodyText = bodyHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

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
        
        isCar: !parsed.isJunk && (parsed.make !== "Unknown" || listing.make !== "Unknown"),
        isJunk: parsed.isJunk,
        parseScore: parsed.parseScore,
        parsedAt: new Date(),
      }
    });

    return updated;
  } catch (err) {
    console.error(`Failed to enrich ${listingId}:`, err);
    return null;
  }
}
