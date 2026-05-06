import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { runBrightdataScraper } from '../lib/scraper/brightdataScraper';

async function main() {
  console.log('Starting standalone Brightdata scraper run...');
  await runBrightdataScraper();
  console.log('Run complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error running Brightdata scraper:', err);
  process.exit(1);
});
