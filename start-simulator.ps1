Write-Host "Starting Device Simulator..." -ForegroundColor Green
Set-Location BE_Server-side
node src/simulator/device-simulator.js
Read-Host "Press Enter to exit"