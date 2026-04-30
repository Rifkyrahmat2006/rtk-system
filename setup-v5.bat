@echo off
echo ========================================
echo RTK v5.0 - Quick Setup
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
echo OK: Node.js installed
echo.

echo [2/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo OK: Dependencies installed
echo.

echo [3/5] Checking .env file...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env and configure MySQL credentials!
    echo Then run this script again.
    pause
    exit /b 0
)
echo OK: .env exists
echo.

echo [4/5] Initializing database...
call npm run db:init
if errorlevel 1 (
    echo ERROR: Database initialization failed
    echo Check:
    echo   - MySQL is running
    echo   - Credentials in .env are correct
    echo   - Database exists
    pause
    exit /b 1
)
echo OK: Database initialized
echo.

echo [5/5] Running tests...
node test-db.js
if errorlevel 1 (
    echo WARNING: Some tests failed
    echo Server will still run, but check database connection
    echo.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Register your project:
echo      @rtk_project_register name: myproject, path: C:\path
echo.
echo   2. Index your project:
echo      npm run index myproject
echo.
echo   3. Start server:
echo      npm start
echo.
echo Documentation: SETUP-V5.md
echo.
pause
