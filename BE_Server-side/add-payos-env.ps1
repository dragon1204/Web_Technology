# PowerShell script để thêm PayOS environment variables vào file .env
# Chạy script này trên server (nếu dùng PowerShell)

$envFile = "BE_Server-side\.env"

# Kiểm tra file .env có tồn tại không
if (-not (Test-Path $envFile)) {
    Write-Host "❌ File .env không tìm thấy tại: $envFile" -ForegroundColor Red
    Write-Host "📁 Đang tìm file .env..." -ForegroundColor Yellow
    Get-ChildItem -Recurse -Filter ".env" -File -ErrorAction SilentlyContinue | Select-Object -First 5 FullName
    exit 1
}

Write-Host "✅ Tìm thấy file .env tại: $envFile" -ForegroundColor Green
Write-Host ""

# Kiểm tra xem PayOS variables đã tồn tại chưa
$content = Get-Content $envFile -Raw
if ($content -match "PAYOS_CLIENT_ID") {
    Write-Host "⚠️  PayOS variables đã tồn tại trong file .env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Các dòng PayOS hiện tại:" -ForegroundColor Cyan
    Get-Content $envFile | Select-String "PAYOS"
    Write-Host ""
    $confirm = Read-Host "Bạn có muốn cập nhật lại không? (y/n)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Hủy bỏ." -ForegroundColor Yellow
        exit 0
    }
    # Xóa các dòng PayOS cũ
    $newContent = Get-Content $envFile | Where-Object { $_ -notmatch "^PAYOS_" }
    $newContent | Set-Content $envFile
    Write-Host "✅ Đã xóa các PayOS variables cũ" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Thêm PayOS environment variables vào file .env..." -ForegroundColor Cyan
Write-Host ""

# Thêm PayOS variables vào cuối file
$payosConfig = @"

# PayOS Payment Configuration
# Lấy credentials từ PayOS Dashboard: https://pay.payos.vn/
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
"@

Add-Content -Path $envFile -Value $payosConfig

Write-Host "✅ Đã thêm PayOS variables vào file .env" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nội dung PayOS variables vừa thêm:" -ForegroundColor Cyan
Get-Content $envFile | Select-Object -Last 4
Write-Host ""
Write-Host "⚠️  QUAN TRỌNG: Bạn cần thay thế các giá trị placeholder:" -ForegroundColor Yellow
Write-Host "   - PAYOS_CLIENT_ID=your_payos_client_id"
Write-Host "   - PAYOS_API_KEY=your_payos_api_key"
Write-Host "   - PAYOS_CHECKSUM_KEY=your_payos_checksum_key"
Write-Host ""
Write-Host "💡 Sử dụng lệnh sau để chỉnh sửa:" -ForegroundColor Cyan
Write-Host "   nano $envFile"
Write-Host "   hoặc"
Write-Host "   vi $envFile"
Write-Host ""
Write-Host "🔄 Sau khi cập nhật, restart backend:" -ForegroundColor Cyan
Write-Host "   pm2 restart backend"
Write-Host "   hoặc"
Write-Host "   npm run start:prod"
