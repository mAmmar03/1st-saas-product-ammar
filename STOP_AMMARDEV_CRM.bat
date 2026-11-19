@echo off
title AmmarDev Influencer CRM - Clean Shutdown
color 0C
cls

echo ======================================================================
echo           AMMARDEV INFLUENCER CRM - CLEAN SHUTDOWN
echo ======================================================================
echo.
echo Stopping Backend (Port 5000) and Frontend (Port 3000 / 3001)...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo.
echo [OK] All AmmarDev CRM servers stopped successfully.
echo.
timeout /t 3
