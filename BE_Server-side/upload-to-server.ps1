# PowerShell script để upload code lên server
# Chạy: .\upload-to-server.ps1

$SERVER_IP = "159.223.61.25"
$SERVER_USER = "root"
$SERVER_PATH = "/var/web"
$LOCAL_PATH = "C:\Users\ASUS\Web_Technology\BE_Server-side"

Write-Host "🚀 Bắt đầu upload code lên server..." -ForegroundColor Green

# Kiểm tra thư mục local
if (-not (Test-Path $LOCAL_PATH)) {
    Write-Host "❌ Không tìm thấy thư mục: $LOCAL_PATH" -ForegroundColor Red
    exit 1
}

# Tạo file tạm để upload
$TEMP_FILE = "BE_Server-side-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz"
$TEMP_PATH = Join-Path $env:TEMP $TEMP_FILE

Write-Host "📦 Đang nén project..." -ForegroundColor Yellow
Set-Location (Split-Path $LOCAL_PATH -Parent)
tar -czf $TEMP_PATH -C (Split-Path $LOCAL_PATH -Parent) BE_Server-side

if (-not (Test-Path $TEMP_PATH)) {
    Write-Host "❌ Lỗi khi nén file" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Đã nén thành công: $TEMP_PATH" -ForegroundColor Green
Write-Host "📤 Đang upload lên server..." -ForegroundColor Yellow

# Upload file
scp $TEMP_PATH "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Upload thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Tiếp theo, SSH vào server và chạy:" -ForegroundColor Cyan
    Write-Host "   ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor White
    Write-Host "   cd ${SERVER_PATH}" -ForegroundColor White
    Write-Host "   tar -xzf $TEMP_FILE" -ForegroundColor White
    Write-Host "   cd BE_Server-side" -ForegroundColor White
    Write-Host "   bash deploy.sh" -ForegroundColor White
} else {
    Write-Host "❌ Lỗi khi upload file" -ForegroundColor Red
}

# Xóa file tạm
Remove-Item $TEMP_PATH -ErrorAction SilentlyContinue

