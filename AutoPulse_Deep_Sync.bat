@echo off
title AutoPulse DEEP RICH SYNC
echo ========================================================
echo 🛡️  AUTOPULSE DEEP SYNC: QUALITY OVER QUANTITY
echo ========================================================
echo.
echo Mode: DEEP (Slower, but perfectly populates all features)
echo Goal: Capture all AWD/Leather/Transmission details for Filters.
echo.

:: Override env vars for this session
SET SWEEP_CONCURRENCY=1
SET MAX_PAGES_PER_CITY=2
SET DEEP_ENRICH=true

npm run agency-sweep
pause
