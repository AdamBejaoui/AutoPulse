
import "../lib/envBootstrap";
import { chromium } from "playwright";
import { parseListingText } from "../lib/parser/listingParser";

async function testExtraction(url: string) {
    console.log(`Testing extraction for: ${url}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait for content
        await page.waitForSelector('div[role="main"]', { timeout: 10000 }).catch(() => {});
        
        // Try See More click
        const seeMoreSelectors = [
            'div[role="button"]:has-text("See More")',
            'div[role="button"]:has-text("Voir plus")',
            'span:has-text("See More")',
            'span:has-text("Voir plus")'
        ];
        
        let clicked = false;
        for (const selector of seeMoreSelectors) {
            try {
                const btn = page.locator(selector).first();
                if (await btn.isVisible()) {
                    console.log(`Found See More button with selector: ${selector}. Clicking...`);
                    await btn.click();
                    await page.waitForTimeout(1000);
                    clicked = true;
                    break;
                }
            } catch (e) { /* ignore */ }
        }

        const data = await page.evaluate(() => {
            const domDesc = document.querySelector('div[data-testid="marketplace_listing_description"]')?.textContent ||
                            document.querySelector('div[dir="auto"] > span[dir="auto"]')?.parentElement?.textContent ||
                            Array.from(document.querySelectorAll('div[dir="auto"]')).find(el => el.textContent?.length && el.textContent.length > 100)?.textContent;
            
            return {
                description: domDesc || null,
            };
        });

        console.log("-----------------------------------------");
        if (data.description) {
            console.log("✅ Extraction Successful!");
            console.log(`Description Length: ${data.description.length}`);
            console.log(`Content Preview: ${data.description.substring(0, 300)}...`);
        } else {
            console.log("❌ Extraction Failed: No description found.");
        }
        console.log("-----------------------------------------");

    } catch (e) {
        console.error("Error during extraction:", e);
    } finally {
        await browser.close();
    }
}

// Use a real URL from the user's browser or DB
const targetUrl = "https://www.facebook.com/marketplace/item/838461468566462/";
testExtraction(targetUrl).catch(console.error);
