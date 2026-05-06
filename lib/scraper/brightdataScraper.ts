import { chromium, Page } from 'playwright';
import { parseListingText, isJunkTitle } from '../parser/listingParser';

// ─── SAFETY CONFIG ────────────────────────────────────────────────────────────
const MAX_URLS_PER_RUN = 24;
const MAX_PAGES_PER_URL = 2;
// ──────────────────────────────────────────────────────────────────────────────

export async function runBrightdataScraper() {
  console.log('--- STARTING BRIGHTDATA SCRAPE (MEGA HARVEST MODE) ---');
  
  if (!process.env.BRIGHTDATA_WS_ENDPOINT) {
    throw new Error('BRIGHTDATA_WS_ENDPOINT is not set in .env');
  }

  const { prisma } = await import('../db');
  const { matchListingToSubscriptions } = await import('../alertMatcher');

  // 1. Fetch active subscriptions for priority targeting
  const subs = await prisma.subscription.findMany({
    select: { make: true, model: true, city: true },
    where: { OR: [{ make: { not: null } }, { model: { not: null } }] }
  });

  const combos = Array.from(new Set(subs.map(s => `${s.make || ''} ${s.model || ''}`.trim()))).filter(Boolean);
  console.log(`\n🎯 Active subscriptions: ${subs.length} (${combos.length} unique combos)`);

  // 2. Build targeted URLs
  const targetMakes = ['Toyota', 'Honda', 'Mazda', 'Lexus', 'Hyundai', 'Kia'];
  const targetCities = [
    'philadelphia', 'pittsburgh', // PA
    'richmond', // VA
    'charlotte', 'raleigh', // NC
    'columbia', 'charleston', // SC
    'atlanta', // GA
    'miami', 'orlando', 'tampa', // FL
    'charleston', // WVA
    'nashville', 'memphis', // TN
    'birmingham', // AL
    'columbus', 'cleveland', // OH
    'indianapolis', // IN
    'louisville', // KY
    'detroit', // MI
    'neworleans', // LA
    'littlerock', // AR
    'stlouis', 'kansascity', // MO
    'desmoines', // IA
    'minneapolis', // MN
    'houston', 'dallas', 'sanantonio', // TX
    'oklahomacity', // OK
    'wichita', // KS
    'albuquerque', // NM
    'denver', // CO
    'cheyenne', // WY
    'omaha', // NE
    'siouxfalls', // SD
    'fargo', // ND
    'saltlakecity' // UT
  ];

  const startUrls: { url: string, city: string }[] = [];

  // Priority car+city searches from subscriptions (shuffle to cycle through cities fairly)
  const priorityUrls: { url: string, city: string }[] = [];
  for (const combo of combos) {
    for (const city of targetCities) {
      priorityUrls.push({
        url: `https://www.facebook.com/marketplace/${city}/search?query=${encodeURIComponent(combo)}&category_id=vehicles&sort=CREATION_TIME_DESCEND`,
        city: city
      });
    }
  }
  priorityUrls.sort(() => Math.random() - 0.5);

  // General searches for requested makes
  const generalUrls: { url: string, city: string }[] = [];
  for (const make of targetMakes) {
    for (const city of targetCities) {
      generalUrls.push({
        url: `https://www.facebook.com/marketplace/${city}/search?query=${encodeURIComponent(make)}&category_id=vehicles&sort=CREATION_TIME_DESCEND`,
        city: city
      });
    }
  }
  generalUrls.sort(() => Math.random() - 0.5);

  // Combine them, putting priority URLs first
  startUrls.push(...priorityUrls, ...generalUrls);
  const finalUrls = startUrls.slice(0, MAX_URLS_PER_RUN);

  console.log(`\n📋 PLAN:`);
  console.log(`   URLs to scrape  : ${finalUrls.length}`);
  console.log(`   Max Pages/URL   : ${MAX_PAGES_PER_URL}`);

  // 3. Connect to Brightdata
  console.log('\n📡 Connecting to Brightdata Scraping Browser...');
  const browser = await chromium.connectOverCDP(process.env.BRIGHTDATA_WS_ENDPOINT);
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  // 4. Scrape URLs
  let totalCommitted = 0;

  for (let i = 0; i < finalUrls.length; i++) {
    const { url, city } = finalUrls[i];
    console.log(`\n[${i + 1}/${finalUrls.length}] 🚗 Scraping: ${url}`);
    
    let page;
    try {
      page = await context.newPage();
    } catch (err: any) {
      if (err.message.includes('closed') || err.message.includes('disconnected')) {
        console.error(`\n🚨 Bright Data session disconnected unexpectedly. Ending Brightdata Phase early to preserve data.`);
        break; // Break out of the URL loop completely
      }
      console.error(`\n🚨 Failed to open new page: ${err.message}`);
      continue;
    }

    try {
      let navSuccess = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          navSuccess = true;
          break; // Navigation succeeded
        } catch (navErr: any) {
          console.warn(`   [Attempt ${attempt}/3] Navigation failed: ${navErr.message}`);
          if (attempt < 3) {
            await page.waitForTimeout(10000); // Wait 10s before retrying to let Brightdata allocate a new peer
          } else {
            throw navErr; // Re-throw on final failure
          }
        }
      }
      
      if (!navSuccess) throw new Error("Failed to navigate after 3 attempts");

      await page.waitForTimeout(5000); // Increased initial wait slightly to let React render

      const allCards = new Map(); // Use map to deduplicate by externalId

      // Paginate / Scroll up to MAX_PAGES_PER_URL times
      for (let pageNum = 0; pageNum < MAX_PAGES_PER_URL; pageNum++) {
        // Extract listing cards
        const cards = await page.evaluate(() => {
          const items: any[] = [];
          const links = Array.from(document.querySelectorAll('a[href*="/marketplace/item/"]'));
          
          links.forEach(link => {
            const href = link.getAttribute('href') || '';
            const match = href.match(/item\/(\d+)/);
            if (!match) return;
            
            const externalId = match[1];
            const container = link.closest('div[style*="max-width"]') || link.parentElement;
            if (!container) return;

            const titleEl = container.querySelector('span[style*="webkit-line-clamp"]');
            const priceEl = Array.from(container.querySelectorAll('span')).find(s => s.textContent?.includes('$'));
            const imgEl = container.querySelector('img');

            if (titleEl && priceEl) {
              items.push({
                externalId,
                title: titleEl.textContent?.trim(),
                priceText: priceEl.textContent?.trim(),
                imageUrl: imgEl?.getAttribute('src'),
                url: 'https://www.facebook.com' + href.split('?')[0]
              });
            }
          });
          return items;
        });

        cards.forEach(c => allCards.set(c.externalId, c));

        if (pageNum < MAX_PAGES_PER_URL - 1) {
           await page.evaluate(() => window.scrollBy(0, 2000));
           await page.waitForTimeout(2500);
        }
      }

      console.log(`   Found ${allCards.size} unique listings on this URL.`);

      let urlCount = 0;
      for (const card of allCards.values()) {
        // Safe regex to extract price. If it's something like $2,5002005 (concatenated text),
        // we'll try to match the comma pattern first.
        const priceMatch = card.priceText.match(/\$([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)/);
        if (!priceMatch) continue;
        const priceNum = parseInt(priceMatch[1].replace(/,/g, ''), 10);
        
        // Filter out unreasonable prices and prevent Postgres 32-bit Int overflow (> ~21 million)
        if (isNaN(priceNum) || priceNum < 500 || priceNum > 150000) continue; 
        if (isJunkTitle(card.title)) continue;

        const parsed = parseListingText(card.title, ""); 

        const listingData = {
          externalId: card.externalId,
          source: 'facebook',
          rawTitle: card.title,
          description: "Details pending deep scan...",
          listingUrl: card.url,
          price: priceNum * 100,
          imageUrls: card.imageUrl ? [card.imageUrl] : [],
          city: city, // Extracted from URL iteration
          state: null, // Since we don't have full city label readily, null is fine for now
          postedAt: new Date(),
          
          make: parsed.make,
          model: parsed.model,
          year: parsed.year,
          mileage: parsed.mileage,
          trim: parsed.trim,
          bodyStyle: parsed.bodyStyle,
          driveType: parsed.driveType,
          engine: parsed.engine,
          transmission: parsed.transmission,
          fuelType: parsed.fuelType,
          color: parsed.color,
          doors: parsed.doors,
          titleStatus: parsed.titleStatus,
          condition: parsed.condition,
          accidents: parsed.accidents,
          owners: parsed.owners,
          features: parsed.features,
          vin: parsed.vin,
          isJunk: parsed.isJunk,
          isCar: !parsed.isJunk && parsed.make !== "Unknown",
          parseScore: parsed.parseScore,
          parsedAt: new Date(),
        };

        try {
          const listing = await prisma.listing.upsert({
            where: { externalId: listingData.externalId },
            update: {
                price: listingData.price,
                rawTitle: listingData.rawTitle,
                imageUrls: listingData.imageUrls.length > 0 ? listingData.imageUrls : undefined
            },
            create: listingData,
          });

          if (listing) {
            urlCount++;
            matchListingToSubscriptions(listing).catch(() => {});
          }
        } catch (dbErr) { }
      }
      totalCommitted += urlCount;
      console.log(`   Committed ${urlCount} cars.`);
      
    } catch (err: any) {
      console.error(`   Error scraping ${url}:`, err.message);
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  await browser.close();
  await prisma.$disconnect();
  console.log(`--- BRIGHTDATA SCRAPE COMPLETE (Total Committed: ${totalCommitted}) ---`);
}
