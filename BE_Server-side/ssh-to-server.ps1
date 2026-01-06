# PowerShell script để SSH vào server
# IP: 159.223.61.25
# User: root
# Password: 8dee5a15756d8f73d03b73fb83

Write-Host "Đang kết nối đến server..." -ForegroundColor Cyan
Write-Host "IP: 159.223.61.25" -ForegroundColor Yellow
Write-Host "User: root" -ForegroundColor Yellow
Write-Host ""

# SSH command
ssh root@159.223.61.25

# Lưu ý: PowerShell trên Windows có thể cần cài OpenSSH client
# Nếu chưa có, cài bằng: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

