@echo off
echo Starting Garden IoT Dashboard Development Environment...
echo.

echo Starting Backend (NestJS)...
start "Backend Server" cmd /k "cd BE_Server-side && npm run start:dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend (React)...
start "Frontend Server" cmd /k "cd FE_web_application/fe_dashboard && npm start"

echo.
echo Development servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo Swagger API: http://localhost:3000/api
echo.
echo Press any key to exit...
pause > nul