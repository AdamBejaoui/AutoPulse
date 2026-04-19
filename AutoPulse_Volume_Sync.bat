@echo off
TITLE AutoPulse: MEGA VOLUME SYNC (FAST MODE)
echo ========================================================
echo 🛡️  AUTOPULSE MEGA VOLUME SYNC: STARTING US-WIDE GROWTH
echo ========================================================
echo.
echo Mode: FAST (Search Only, No 30s Enrichment)
echo Goal: 20,000+ Listings quickly for Demo.
echo.

:: Set environment variables for this session
SET DEEP_ENRICH=false
SET SKIP_DASHBOARD=true

:: Start the sync
npm run agency-sweep

echo.
echo ========================================================
echo ✅ VOLUME SYNC COMPLETE. SITE IS NOW POPULATED.
echo ========================================================
pause
