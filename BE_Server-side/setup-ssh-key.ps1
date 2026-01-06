# Script để setup SSH key cho server
# IP: 159.223.61.25
# User: root

Write-Host "=== Setup SSH Key cho Server ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra xem đã có SSH key chưa
$sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa.pub"
if (Test-Path $sshKeyPath) {
    Write-Host "✅ Đã tìm thấy SSH key tại: $sshKeyPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Public key của bạn:" -ForegroundColor Yellow
    Get-Content $sshKeyPath
    Write-Host ""
    Write-Host "Bạn cần copy public key này và thêm vào server:" -ForegroundColor Cyan
    Write-Host "  ~/.ssh/authorized_keys" -ForegroundColor White
} else {
    Write-Host "❌ Chưa có SSH key. Đang tạo mới..." -ForegroundColor Yellow
    Write-Host ""
    
    # Tạo SSH key
    ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\id_rsa" -N '""'
    
    Write-Host ""
    Write-Host "✅ Đã tạo SSH key!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Public key của bạn:" -ForegroundColor Yellow
    Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub"
    Write-Host ""
    Write-Host "Bạn cần copy public key này và thêm vào server:" -ForegroundColor Cyan
    Write-Host "  ~/.ssh/authorized_keys" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Hướng Dẫn Thêm Key Vào Server ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nếu bạn có cách truy cập server khác (web console, etc):" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SSH vào server bằng cách khác" -ForegroundColor White
Write-Host "2. Chạy các lệnh sau:" -ForegroundColor White
Write-Host ""
Write-Host "   mkdir -p ~/.ssh" -ForegroundColor Green
Write-Host "   chmod 700 ~/.ssh" -ForegroundColor Green
Write-Host "   nano ~/.ssh/authorized_keys" -ForegroundColor Green
Write-Host "   # Paste public key ở trên vào file" -ForegroundColor Gray
Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Green
Write-Host ""
Write-Host "3. Sau đó SSH lại:" -ForegroundColor White
Write-Host "   ssh root@159.223.61.25" -ForegroundColor Green
Write-Host ""

