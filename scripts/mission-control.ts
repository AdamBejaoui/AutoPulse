import { execSync } from 'child_process';

async function missionControl() {
    console.log('🚀 AUTOPULSE MISSION CONTROL STARTED');
    console.log('------------------------------------');
    console.log('Mode: Continuous Scraping + Free Detail Enrichment');
    
    while (true) {
        try {
            console.log(`\n[${new Date().toLocaleTimeString()}] 📡 Phase 1: Checking for NEW cars on Brightdata...`);
            // Run the scraper (this takes ~5-10 mins)
            execSync('npx ts-node scripts/run-brightdata.ts', { stdio: 'inherit' });

            console.log(`\n[${new Date().toLocaleTimeString()}] 🛠️ Phase 2: Starting background detail repair...`);
            // Run the free enrichment to clear the queue before resting
            for (let i = 0; i < 2; i++) {
                console.log(`   Sync batch ${i+1}/2...`);
                execSync('npx ts-node scripts/bulk-enrich.ts', { stdio: 'inherit' });
                
                // Every other batch, let's also check for sold cars (keep inventory clean)
                if (i % 2 === 0) {
                    console.log('   Checking for sold vehicles...');
                    execSync('npx ts-node scripts/check-sold.ts', { stdio: 'inherit' });
                }

                await new Promise(r => setTimeout(r, 60000)); 
            }

            console.log('\n🔥 Running at MAXIMUM SPEED! Resting for only 10 minutes before the next sweep...');
            await new Promise(r => setTimeout(r, 600000)); // 10 mins pause
        } catch (err) {
            console.error('⚠️ Mission Control encountered an error, restarting in 5 mins...', err);
            await new Promise(r => setTimeout(r, 300000));
        }
    }
}

missionControl();
