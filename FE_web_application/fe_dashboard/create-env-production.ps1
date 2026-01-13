# Script tạo file .env.production cho Firebase Hosting
# Chạy script này: .\create-env-production.ps1

$envContent = @"
# Production Environment Variables
# Firebase Hosting sẽ tự động dùng HTTPS, nên API cũng cần HTTPS
# ⚠️ QUAN TRỌNG: Backend hiện tại chưa hỗ trợ HTTPS, nên dùng HTTP tạm thời
# Sau khi setup HTTPS cho backend, đổi tất cả http:// thành https://

# API Configuration - Dùng HTTP vì backend chưa có HTTPS
# Sau khi backend có HTTPS, đổi thành:
# REACT_APP_API_BASE_URL=https://159.223.61.25:3000
# REACT_APP_API_URL=https://159.223.61.25:3000
# REACT_APP_GOOGLE_AUTH_URL=https://159.223.61.25:3000/auth/google
# REACT_APP_SIMULATOR_WS_URL=wss://159.223.61.25:8080
REACT_APP_API_BASE_URL=http://159.223.61.25:3000
REACT_APP_API_URL=http://159.223.61.25:3000
REACT_APP_GOOGLE_AUTH_URL=http://159.223.61.25:3000/auth/google
REACT_APP_SIMULATOR_WS_URL=ws://159.223.61.25:8080
"@

$envFile = ".env.production"

if (Test-Path $envFile) {
    Write-Host "⚠️  File .env.production đã tồn tại!" -ForegroundColor Yellow
    $overwrite = Read-Host "Bạn có muốn ghi đè không? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "❌ Đã hủy." -ForegroundColor Red
        exit
    }
}

$envContent | Out-File -FilePath $envFile -Encoding utf8
Write-Host "✅ Đã tạo file .env.production thành công!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Lưu ý:" -ForegroundColor Cyan
Write-Host "   - Nếu backend chưa có HTTPS, sửa URL thành http:// trong file .env.production" -ForegroundColor Yellow
Write-Host "   - Sau đó chạy: npm run build && npm run deploy" -ForegroundColor Yellow
