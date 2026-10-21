@echo off
title AI Search Lab - Interactive Algorithm Visualiser
cd /d "%~dp0"

echo ==============================================================================
echo   AI Search Lab - Interactive Search Algorithm Visualiser
echo   Artificial Intelligence Foundations - Search Algorithms (Node.js)
echo ==============================================================================
echo.
echo [1/2] Configuring environment paths for Node.js...
set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\nodejs;%PATH%"

echo [2/2] Starting AI Search Lab on port 5173...
start "AI Search Lab Server" cmd /k "cd /d "%~dp0frontend" && set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\nodejs;%PATH%" && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Waiting 3 seconds for server to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Launching AI Search Lab in your default web browser...
start http://localhost:5173/

echo.
echo ==============================================================================
echo   AI Search Lab is now running!
echo   URL: http://localhost:5173/
echo ==============================================================================
