@echo off
title AmolGraphics - Dev Server
color 0A

echo.
echo  ================================================
echo    AmolGraphics - Starting Development Servers
echo  ================================================
echo.

:: Start MySQL Database (XAMPP fallback)
echo [0/3] Checking MySQL Database connection (port 3306)...
netstat -aon | findstr ":3306 " >nul
if %errorlevel% neq 0 (
    echo     MySQL is offline. Attempting to auto-start XAMPP MySQL...
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start "MySQL Server" "C:\xampp\mysql\bin\mysqld.exe"
        echo     MySQL Started successfully!
        timeout /t 3 /nobreak >nul
    ) else (
        echo     [WARNING] Could not locate XAMPP. You must start MySQL manually!
    )
) else (
    echo     MySQL is already running perfectly.
)
echo.
:: Kill any process using port 3000 or 5000
echo [1/3] Clearing ports 3000 and 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo     Done.
echo.

:: Start Backend (port 5000)
echo [2/3] Starting Backend API (port 5000)...
start "AmolGraphics Backend :5000" cmd /k "cd /d %~dp0backend && npx ts-node index.ts"
timeout /t 3 /nobreak >nul

:: Start Frontend (port 3000)
echo [3/3] Starting Frontend (port 3000)...
start "AmolGraphics Frontend :3000" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo  ================================================
echo    Both servers are starting!
echo.
echo    Frontend : http://localhost:3000
echo    Backend  : http://localhost:5000
echo    Admin    : http://localhost:3000/admin
echo  ================================================
echo.
echo  Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo  You can close this window. The server windows will keep running.
pause
