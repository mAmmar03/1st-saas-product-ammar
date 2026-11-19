@echo off
title AmmarDev Influencer CRM - Enterprise Launcher
cls

echo ======================================================================
echo           AMMARDEV INFLUENCER CRM - ENTERPRISE LAUNCHER
echo ======================================================================
echo.

:: 1. Verify Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found on your computer!
    echo Please install Node.js LTS from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Free up ports 5000 and 3000 to prevent conflicts
echo [1/4] Checking and freeing ports 5000 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>nul

:: 3. Check MongoDB service
echo [2/4] Checking MongoDB Database Service...
sc query MongoDB | find "RUNNING" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    net start MongoDB >nul 2>nul
)

:: 4. Start Backend Server (Port 5000)
echo [3/4] Launching Backend Server on Port 5000...
start "AmmarDev Backend API (Port 5000)" /D "%~dp0server" cmd /k "node src/server.js"

:: 5. Start Frontend Server (Port 3000)
echo [4/4] Launching Frontend Portal on Port 3000...
start "AmmarDev Frontend UI (Port 3000)" /D "%~dp0client" cmd /k "npm.cmd run dev"

:: 6. Wait 5 seconds for servers to fully initialize
echo.
echo Initializing services, opening Chrome browser in 5 seconds...
ping 127.0.0.1 -n 6 >nul

:: 7. Launch Google Chrome or Default Browser
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
) else (
    start "" "http://localhost:3000"
)

echo.
echo ======================================================================
echo  AMMARDEV CRM IS ACTIVE: http://localhost:3000
echo ======================================================================
echo.
echo  Backend and Frontend are running in their dedicated windows.
echo  Keep those windows minimized while working.
echo  To close the CRM completely, double-click STOP_AMMARDEV_CRM.bat.
echo.
pause
