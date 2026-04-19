@echo off
:: Ensure we are in the project directory
cd /d "%~dp0"

echo ====================================================
echo    AutoPulse: Client Site Manual Sync
echo ====================================================
echo.

:: 1. Check Node
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found. Please install it from nodejs.org
    pause
    exit /b
)

:: 2. Check .env
if not exist .env (
    echo [ERROR] No .env file found in this folder! 
    echo Please make sure your .env file is present.
    pause
    exit /b
)

echo [OK] Node.js and .env detected.
echo [OK] Starting Scraper Sync... 
echo (This window will stay open when finished)
echo.

:: 3. Run the script
call npm run agency-sweep

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The scraper crashed or encountered an error.
    echo Please check the messages above.
) else (
    echo.
    echo [SUCCESS] Sync Complete!
)

echo.
pause
