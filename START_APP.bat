@echo off
title AI Search Lab - Interactive Algorithm Visualiser (CSE276)
cd /d "%~dp0"

echo ==============================================================================
echo   AI Search Lab - Interactive Search Algorithm Visualiser
echo   CSE276 Artificial Intelligence Foundations - Project 21
echo ==============================================================================
echo.
echo [1/3] Configuring environment paths for Node.js and Python...
set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\Python\Python313;%LOCALAPPDATA%\Programs\Python\Python313\Scripts;%PATH%"

echo [2/3] Starting Python FastAPI Backend Server on port 8000...
start "AI Search Lab - Backend Server" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Starting Vite React Frontend Server on port 5173...
start "AI Search Lab - Frontend Server" cmd /k "cd /d "%~dp0frontend" && set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\nodejs;%PATH%" && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Waiting 4 seconds for servers to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Launching AI Search Lab in your default web browser...
start http://localhost:5173/

echo.
echo ==============================================================================
echo   Both Servers are now running!
echo   Frontend: http://localhost:5173/
echo   Backend:  http://127.0.0.1:8000 (API Docs: http://127.0.0.1:8000/api/docs)
echo ==============================================================================
