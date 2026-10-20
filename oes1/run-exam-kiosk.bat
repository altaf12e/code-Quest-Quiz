@echo off
title CodeQuest Exam Lockdown Launcher
echo ========================================================
echo   [!] Launching CodeQuest in Dedicated Locked Mode...
echo   (No browser tabs, no address bar, pure exam mode)
echo ========================================================

REM Check Chrome
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start chrome --app="http://localhost:5500/exam.html" --start-fullscreen
    exit
)

REM Fallback to Microsoft Edge (Default on Windows 10/11)
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start msedge --app="http://localhost:5500/exam.html" --start-fullscreen
    exit
)

REM Generic default browser fallback
start http://localhost:5500/exam.html
exit

