@echo off
echo Installing Node.js dependencies...
call npm install

echo Starting ConcAI Frontend...
call npm run dev

pause
