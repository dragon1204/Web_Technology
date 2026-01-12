# PowerShell script để cài đặt và chạy MinIO trực tiếp (không cần Docker)

Write-Host "🚀 Setting up MinIO directly (without Docker)..." -ForegroundColor Green
Write-Host ""

$minioExe = "minio.exe"
$dataDir = "C:\minio-data"

# Check if MinIO already exists
if (-not (Test-Path $minioExe)) {
    Write-Host "📥 Downloading MinIO (~15MB)..." -ForegroundColor Yellow
    Write-Host "   This may take a few minutes..." -ForegroundColor Gray
    Write-Host ""
    try {
        # Download with progress
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri "https://dl.min.io/server/minio/release/windows-amd64/minio.exe" -OutFile $minioExe -UseBasicParsing
        Write-Host "✅ MinIO downloaded successfully ($([math]::Round((Get-Item $minioExe).Length / 1MB, 2)) MB)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download MinIO: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Please download manually from:" -ForegroundColor Yellow
        Write-Host "   https://dl.min.io/server/minio/release/windows-amd64/minio.exe" -ForegroundColor Cyan
        Write-Host "   Then place minio.exe in the current directory" -ForegroundColor Gray
        exit 1
    }
} else {
    Write-Host "✅ MinIO executable found ($([math]::Round((Get-Item $minioExe).Length / 1MB, 2)) MB)" -ForegroundColor Green
}

# Create data directory
if (-not (Test-Path $dataDir)) {
    Write-Host "📁 Creating data directory: $dataDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "✅ Data directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Data directory exists: $dataDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting MinIO..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Access Information:" -ForegroundColor Yellow
Write-Host "   MinIO API: http://localhost:9000" -ForegroundColor White
Write-Host "   MinIO Console: http://localhost:9001" -ForegroundColor White
Write-Host "   Username: minioadmin" -ForegroundColor White
Write-Host "   Password: minioadmin" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Press Ctrl+C to stop MinIO" -ForegroundColor Yellow
Write-Host ""

# Set environment variables and start MinIO
$env:MINIO_ROOT_USER = "minioadmin"
$env:MINIO_ROOT_PASSWORD = "minioadmin"

# Start MinIO
& ".\$minioExe" server $dataDir --console-address ":9001"
