import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '../.env') });

// Force the scraper to go extremely deep
process.env.MAX_PAGES_PER_URL = '15'; // 15 pages deep per URL to find cars from a month ago
process.env.MAX_URLS_PER_RUN = '50';  // Scrape 50 cities in one giant run

console.log('⛏️ DEEP DIG MODE ENGAGED');
console.log(`Setting Max Pages to ${process.env.MAX_PAGES_PER_URL} and Max URLs to ${process.env.MAX_URLS_PER_RUN}`);

import { runBrightdataScraper } from '../lib/scraper/brightdataScraper';

runBrightdataScraper().catch(console.error);
