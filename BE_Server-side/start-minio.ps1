# Script đơn giản để khởi động MinIO
# Sử dụng: .\start-minio.ps1

Write-Host "🔍 Checking MinIO status..." -ForegroundColor Cyan

# Check if MinIO is already running
$minioRunning = Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue

if ($minioRunning) {
    Write-Host "✅ MinIO is already running on port 9000" -ForegroundColor Green
    Write-Host "   API: http://localhost:9000" -ForegroundColor White
    Write-Host "   Console: http://localhost:9001" -ForegroundColor White
    exit 0
}

Write-Host "❌ MinIO is not running" -ForegroundColor Red
Write-Host ""

# Check for MinIO executable
$minioExe = "minio.exe"
$dataDir = "C:\minio-data"

if (-not (Test-Path $minioExe)) {
    Write-Host "⚠️  MinIO executable not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Options:" -ForegroundColor Cyan
    Write-Host "   1. Run setup script: .\setup-minio-direct.ps1" -ForegroundColor White
    Write-Host "   2. Or use Docker: .\setup-minio-local.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Create data directory if not exists
if (-not (Test-Path $dataDir)) {
    Write-Host "📁 Creating data directory: $dataDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

Write-Host ""
Write-Host "🚀 Starting MinIO..." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Access Information:" -ForegroundColor Yellow
Write-Host "   MinIO API: http://localhost:9000" -ForegroundColor White
Write-Host "   MinIO Console: http://localhost:9001" -ForegroundColor White
Write-Host "   Username: minioadmin" -ForegroundColor White
Write-Host "   Password: minioadmin" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Press Ctrl+C to stop MinIO" -ForegroundColor Yellow
Write-Host ""

# Set environment variables
$env:MINIO_ROOT_USER = "minioadmin"
$env:MINIO_ROOT_PASSWORD = "minioadmin"

# Start MinIO in background
Start-Process -FilePath ".\$minioExe" -ArgumentList "server $dataDir --console-address `":9001`"" -NoNewWindow

Write-Host "⏳ Waiting for MinIO to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Check if MinIO started successfully
$checkRunning = Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue
if ($checkRunning) {
    Write-Host "✅ MinIO started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Open http://localhost:9001 in browser" -ForegroundColor White
    Write-Host "   2. Login with minioadmin/minioadmin" -ForegroundColor White
    Write-Host "   3. Create bucket named 'files' (if not exists)" -ForegroundColor White
    Write-Host "   4. Restart your NestJS backend" -ForegroundColor White
} else {
    Write-Host "❌ Failed to start MinIO. Please check the error above." -ForegroundColor Red
}
