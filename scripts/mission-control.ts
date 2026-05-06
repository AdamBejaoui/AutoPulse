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

            // Dynamic schedule to balance speed and budget:
            // Assuming server is UTC. Let's run fast (20 mins) during US daytime, slow (60 mins) at night.
            const hour = new Date().getUTCHours();
            const isUsDaytime = (hour >= 12 && hour <= 24) || (hour >= 0 && hour <= 2); // roughly 8 AM to 10 PM EST

            let pauseMs = 3600000; // 60 mins default (Night mode)
            if (isUsDaytime) {
                console.log('\n☀️ DAYTIME MODE: Running fast! Resting for 20 minutes before the next sweep...');
                pauseMs = 1200000; // 20 mins
            } else {
                console.log('\n🌙 NIGHTTIME MODE: Saving budget. Resting for 60 minutes before the next sweep...');
            }
            
            await new Promise(r => setTimeout(r, pauseMs));
        } catch (err) {
            console.error('⚠️ Mission Control encountered an error, restarting in 5 mins...', err);
            await new Promise(r => setTimeout(r, 300000));
        }
    }
}

missionControl();
