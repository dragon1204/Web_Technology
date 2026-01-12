# PowerShell script để setup MinIO trên localhost

Write-Host "🚀 Setting up MinIO on localhost..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
if (Get-Command docker -ErrorAction SilentlyContinue) {
    # Check if Docker daemon is running
    try {
        docker ps | Out-Null
        $dockerRunning = $true
    } catch {
        $dockerRunning = $false
        Write-Host "⚠️  Docker is installed but not running!" -ForegroundColor Yellow
        Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Or use direct installation: .\setup-minio-direct.ps1" -ForegroundColor Cyan
        exit 1
    }
    
    if ($dockerRunning) {
        Write-Host "🐳 Docker found and running. Using Docker to run MinIO..." -ForegroundColor Yellow
        Write-Host ""
        
        # Check if container already exists
        $existing = docker ps -a --filter "name=minio" --format "{{.Names}}" 2>$null
    
    if ($existing -eq "minio") {
        Write-Host "⚠️  MinIO container already exists. Stopping and removing..." -ForegroundColor Yellow
        docker stop minio 2>$null
        docker rm minio 2>$null
    }
    
    # Run MinIO
    Write-Host "📦 Starting MinIO container..." -ForegroundColor Cyan
    docker run -d `
      --name minio `
      -p 9000:9000 `
      -p 9001:9001 `
      -e "MINIO_ROOT_USER=minioadmin" `
      -e "MINIO_ROOT_PASSWORD=minioadmin" `
      -v minio-data:/data `
      minio/minio server /data --console-address ":9001"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ MinIO started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Access Information:" -ForegroundColor Cyan
        Write-Host "   MinIO API: http://localhost:9000" -ForegroundColor White
        Write-Host "   MinIO Console: http://localhost:9001" -ForegroundColor White
        Write-Host "   Username: minioadmin" -ForegroundColor White
        Write-Host "   Password: minioadmin" -ForegroundColor White
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Open http://localhost:9001 in browser" -ForegroundColor White
        Write-Host "   2. Login with minioadmin/minioadmin" -ForegroundColor White
        Write-Host "   3. Create bucket named 'files'" -ForegroundColor White
        Write-Host "   4. Update .env file with MinIO config" -ForegroundColor White
        Write-Host "   5. Run: npm install minio @types/multer multer" -ForegroundColor White
        } else {
            Write-Host "❌ Failed to start MinIO container" -ForegroundColor Red
            Write-Host ""
            Write-Host "💡 Try direct installation instead: .\setup-minio-direct.ps1" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ Docker not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Options:" -ForegroundColor Yellow
    Write-Host "   1. Install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    Write-Host "   2. Use direct installation: .\setup-minio-direct.ps1" -ForegroundColor Cyan
}
