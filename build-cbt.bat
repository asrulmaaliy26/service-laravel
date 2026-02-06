@echo off
REM Build Script untuk CBT App
REM Gunakan script ini untuk build frontend sebelum upload ke VPS

echo ========================================
echo CBT App - Build Script
echo ========================================
echo.

REM Pindah ke folder frontend
cd frontend

echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Building production bundle...
call npm run build

echo.
echo [3/4] Copying build to public/cbt-app...
xcopy /E /I /Y dist\* ..\public\cbt-app\

echo.
echo [4/4] Cleaning up...
REM Optional: hapus folder dist setelah copy
REM rmdir /S /Q dist

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Files ready for upload in: public\cbt-app\
echo.
echo Next steps:
echo 1. Update frontend/config.ts with production URL
echo 2. Upload public/cbt-app/ to VPS
echo 3. Test camera and session functionality
echo.
pause
