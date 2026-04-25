import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

// Limit how many we check per run to avoid being flagged
const CHECK_LIMIT = 50; 

async function checkSoldStatus() {
  console.log('🔍 Starting Sold Status Checker...');
  
  const listings = await prisma.listing.findMany({
    where: {
      isSold: false,
      isJunk: false,
    },
    orderBy: {
      updatedAt: 'asc', // Check the ones we haven't touched in a while
    },
    take: CHECK_LIMIT,
  });

  if (listings.length === 0) {
    console.log('✅ No active listings to check.');
    return;
  }

  console.log(`📡 Checking ${listings.length} listings...`);

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  // Inject cookies if available
  const rawCookies = process.env.FB_COOKIES || '';
  if (rawCookies) {
    try {
      const cookies = JSON.parse(rawCookies.replace(/\\/g, ''));
      await context.addCookies(cookies);
      console.log('🍪 Session cookies injected.');
    } catch (e) {
      console.warn('⚠️ Could not parse FB_COOKIES, proceeding as guest.');
    }
  }

  const page = await context.newPage();

  let soldCount = 0;
  let errorCount = 0;

  for (const listing of listings) {
    try {
      console.log(`\n🔗 [${listing.id}] Checking: ${listing.listingUrl}`);
      
      // Navigate with timeout
      await page.goto(listing.listingUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait a bit for dynamic content
      await page.waitForTimeout(2000);

      const content = await page.content();
      
      const isUnavailable = content.includes('This listing is no longer available') || 
                          content.includes('listing is no longer available') ||
                          content.includes('This content isn\'t available right now');
      
      const isMarkedSold = content.includes('Sold') && 
                          (content.includes('Item sold') || content.includes('This item was sold'));

      // Check for the "Sold" badge element if possible
      const soldBadge = await page.$('text="Sold"');

      if (isUnavailable || isMarkedSold || soldBadge) {
        console.log(`🚩 DETECTED AS SOLD: ${listing.make} ${listing.model}`);
        await prisma.listing.update({
          where: { id: listing.id },
          data: { isSold: true }
        });
        soldCount++;
      } else {
        console.log(`✅ Still active.`);
        // Update updatedAt so we don't check it again immediately
        await prisma.listing.update({
          where: { id: listing.id },
          data: { updatedAt: new Date() }
        });
      }

      // Random delay to mimic human browsing
      await page.waitForTimeout(Math.floor(Math.random() * 3000) + 1000);

    } catch (err: any) {
      console.error(`❌ Error checking ${listing.id}:`, err.message);
      errorCount++;
    }
  }

  await browser.close();
  await prisma.$disconnect();

  console.log('\n═══════════════════════════════════════');
  console.log('📊 CHECK COMPLETE');
  console.log(`✅ Active: ${listings.length - soldCount - errorCount}`);
  console.log(`🚩 Sold:   ${soldCount}`);
  console.log(`⚠️ Errors: ${errorCount}`);
  console.log('═══════════════════════════════════════');
}

checkSoldStatus().catch(console.error);
