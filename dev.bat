@echo off
title AmolGraphics - Dev Manager
color 0A

:MENU
cls
echo.
echo  =====================================================
echo    AmolGraphics ^| Development Control Panel
echo  =====================================================
echo.
echo    [1]  START  - Launch all servers
echo    [2]  STOP   - Shut down all servers
echo    [3]  RESTART - Stop then Start
echo    [4]  STATUS  - Check what is running
echo    [5]  EXIT
echo.
echo  =====================================================
echo.
set /p choice=  Choose an option (1-5): 

if "%choice%"=="1" goto START
if "%choice%"=="2" goto STOP
if "%choice%"=="3" goto RESTART
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" exit
goto MENU


:: ─────────────────────────────────────────────
:START
cls
color 0A
echo.
echo  [START] Launching AmolGraphics Dev Environment...
echo.

:: ── Step 1: MySQL ──
echo  [1/3] Checking MySQL (port 3306)...
netstat -aon | findstr ":3306 " >nul 2>&1
if %errorlevel% neq 0 (
    echo        MySQL is offline. Starting XAMPP MySQL...
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini"
        timeout /t 4 /nobreak >nul
        netstat -aon | findstr ":3306 " >nul 2>&1
        if %errorlevel% equ 0 (
            echo        MySQL started successfully!
        ) else (
            echo        [WARNING] MySQL may not have started. Check XAMPP manually.
        )
    ) else (
        echo        [ERROR] XAMPP not found at C:\xampp\
    )
) else (
    echo        MySQL is already running.
)
echo.

:: ── Step 2: Clear ports ──
echo  [2/3] Clearing ports 3000 and 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo        Ports cleared.
echo.

:: ── Step 3: Start Servers ──
echo  [3/3] Starting servers...
start "AmolGraphics BACKEND :5000" cmd /k "title Backend :5000 && cd /d %~dp0backend && npx ts-node index.ts"
timeout /t 3 /nobreak >nul
start "AmolGraphics FRONTEND :3000" cmd /k "title Frontend :3000 && cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo  =====================================================
echo    All servers are running!
echo.
echo    Frontend  :  http://localhost:3000
echo    Backend   :  http://localhost:5000/api
echo    Admin     :  http://localhost:3000/admin
echo  =====================================================
echo.
echo  Opening browser...
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000/admin"
echo.
pause
goto MENU


:: ─────────────────────────────────────────────
:STOP
cls
color 0C
echo.
echo  [STOP] Shutting down AmolGraphics Dev Environment...
echo.

:: Kill frontend/backend node processes on those ports
echo  Stopping Frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo  Stopping Backend (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo  Stopping MySQL...
C:\xampp\mysql\bin\mysqladmin.exe -u root --host=127.0.0.1 shutdown >nul 2>&1
if %errorlevel% equ 0 (
    echo     MySQL stopped cleanly.
) else (
    taskkill /IM mysqld.exe /F >nul 2>&1
    echo     MySQL force-stopped.
)

echo.
echo  =====================================================
echo    All servers stopped. Safe to shut down your PC.
echo  =====================================================
echo.
pause
goto MENU


:: ─────────────────────────────────────────────
:RESTART
echo.
echo  [RESTART] Stopping then Starting...
echo.
call :STOP_SILENT
timeout /t 2 /nobreak >nul
goto START

:STOP_SILENT
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1
C:\xampp\mysql\bin\mysqladmin.exe -u root --host=127.0.0.1 shutdown >nul 2>&1
if %errorlevel% neq 0 taskkill /IM mysqld.exe /F >nul 2>&1
exit /b


:: ─────────────────────────────────────────────
:STATUS
cls
color 0E
echo.
echo  [STATUS] Checking running services...
echo.

netstat -aon | findstr ":3306 " >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK]  MySQL        - RUNNING on port 3306
) else (
    echo    [!!]  MySQL        - STOPPED
)

netstat -aon | findstr ":5000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK]  Backend API  - RUNNING on port 5000
) else (
    echo    [!!]  Backend API  - STOPPED
)

netstat -aon | findstr ":3000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK]  Frontend     - RUNNING on port 3000
) else (
    echo    [!!]  Frontend     - STOPPED
)

echo.
echo  =====================================================
pause
goto MENU
