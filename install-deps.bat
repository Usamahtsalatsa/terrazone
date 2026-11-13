@echo off
echo ========================================
echo Terra Zone - Installing Dependencies
echo ========================================
echo.

echo [1/2] Installing React Router DOM...
call npm install react-router-dom

echo.
echo [2/2] Installing Tailwind CSS and PostCSS...
call npm install -D tailwindcss postcss autoprefixer

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Now you can run: npm run dev
echo.
pause
