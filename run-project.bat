@echo off
title CodeQuest Launcher
echo =========================================
echo       Starting CodeQuest Platform
echo =========================================
echo.

echo 1. Starting Backend Server on Port 5000...
start "CodeQuest Backend (Port 5000)" cmd /k "cd /d %~dp0oes1\server && npm start"

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend Client on Port 5500...
start "CodeQuest Frontend (Port 5500)" cmd /k "cd /d %~dp0oes1\client && python -m http.server 5500"

timeout /t 2 /nobreak >nul

echo 3. Opening Browser...
start http://localhost:5500

echo.
echo =========================================
echo  CodeQuest is running!
echo  - Frontend: http://localhost:5500
echo  - Backend:  http://localhost:5000
echo  - Admin:    admin / admin123
echo =========================================
pause

