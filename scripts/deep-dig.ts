import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '../.env') });

// Force the scraper to go a bit deeper but conserve credits
process.env.MAX_PAGES_PER_URL = '5';  // 5 pages deep per URL to find cars from a few weeks ago
process.env.MAX_URLS_PER_RUN = '24';  // Stick to the normal 24 cities to save budget

console.log('⛏️ DEEP DIG MODE ENGAGED');
console.log(`Setting Max Pages to ${process.env.MAX_PAGES_PER_URL} and Max URLs to ${process.env.MAX_URLS_PER_RUN}`);

import { runBrightdataScraper } from '../lib/scraper/brightdataScraper';

runBrightdataScraper().catch(console.error);
