@echo off
setlocal
cd /d "%~dp0"

echo 🐍 Python Learning Platform Startup
echo ====================================

echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.x
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python found!

rem Prefer npm workflow when available
where npm >nul 2>&1
if %errorlevel%==0 (
    echo ✅ npm found! Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )

    echo ✅ Dependencies installed!
    echo 🚀 Starting Python Learning Platform with npm...
    echo Open your browser to: http://localhost:3000
    echo Press Ctrl+C to stop the server
    npm start
    endlocal
    exit /b 0
)

echo ⚠️ npm not found. Using bundled Node.js runtime...
if exist "node-bin\node-v20.11.0-win-x64\node.exe" (
    echo ✅ Bundled Node.js found!
    echo.
    echo 🚀 Starting Python Learning Platform with bundled Node...
    echo.
    echo ========================================
    echo Server will start on: http://localhost:3000
    echo ========================================
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    "node-bin\node-v20.11.0-win-x64\node.exe" server.js
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Server failed to start. Check for errors above.
        pause
    )
    endlocal
    exit /b 0
)

echo ❌ Neither npm nor bundled Node.js were found.
echo Please install Node.js from: https://nodejs.org/
pause
endlocal
exit /b 1
