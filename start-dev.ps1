# Garden IoT Dashboard Development Startup Script

Write-Host "🌱 Starting Garden IoT Dashboard Development Environment..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "🚀 Starting Backend (NestJS)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd BE_Server-side; npm run start:dev" -WindowStyle Normal

# Wait for backend to initialize
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "🎨 Starting Frontend (React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd FE_web_application/fe_dashboard; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Development servers are starting..." -ForegroundColor Green
Write-Host "📊 Backend: http://localhost:3000" -ForegroundColor White
Write-Host "🌐 Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "📚 Swagger API: http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")