const { chromium } = require('playwright');

async function testPlaywright() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = "https://www.facebook.com/marketplace/new-york-city/vehicles";
  console.log(`Navigating to ${url}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const title = await page.title();
    console.log(`Page Title: ${title}`);
    
    const count = await page.locator('div[role="main"] a').count();
    console.log(`Found approximately ${count} listings (links) on the first page.`);
    
    await browser.close();
    console.log("Success! Playwright is operational.");
  } catch (error) {
    console.error("Playwright failed:", error);
    await browser.close();
  }
}

testPlaywright();
