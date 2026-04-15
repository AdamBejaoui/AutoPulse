import { chromium } from "playwright";

async function testFBGraphQL() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let totalDataLength = 0;
  let matches = 0;

  page.on('response', async (response) => {
    if (response.url().includes('/api/graphql/') && response.request().method() === 'POST') {
      try {
        const text = await response.text();
        if (text.includes('marketplace_search') || text.includes('MarketplaceSearch')) {
          matches++;
          console.log(`Found Marketplace response, length: ${text.length}`);
          const json = JSON.parse(text);
          // try to sniff out nested data
          const snip = text.substring(0, 500);
          console.log(snip);
        }
      } catch(e) {}
    }
  });

  console.log("Navigating to FB Marketplace...");
  await page.goto("https://www.facebook.com/marketplace/nyc/vehicles?exact=false", { waitUntil: "networkidle" });
  
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, 2000));
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`Total FB GraphQL Marketplace responses caught: ${matches}`);
  await browser.close();
}

testFBGraphQL().catch(console.error);
