# Script cập nhật API URL cho Frontend
# Sử dụng: .\update-api-url.ps1 -ApiUrl "https://garden-iot-api-xxxxx.trycloudflare.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiUrl
)

Write-Host "🔄 Đang cập nhật API URLs..." -ForegroundColor Cyan

# Validate URL
if (-not $ApiUrl.StartsWith("https://")) {
    Write-Host "❌ URL phải bắt đầu với https://" -ForegroundColor Red
    exit 1
}

# Remove trailing slash
$ApiUrl = $ApiUrl.TrimEnd('/')

Write-Host "📝 API URL: $ApiUrl" -ForegroundColor Yellow

# Update .env.production
$envFile = ".env.production"
$envContent = @"
# Production Environment Variables
# Backend HTTPS URL từ Cloudflare Tunnel
REACT_APP_API_BASE_URL=$ApiUrl
REACT_APP_API_URL=$ApiUrl
REACT_APP_GOOGLE_AUTH_URL=$ApiUrl/auth/google
REACT_APP_SIMULATOR_WS_URL=wss://$($ApiUrl.Replace('https://', '')):8080
"@

$envContent | Out-File -FilePath $envFile -Encoding utf8
Write-Host "✅ Đã cập nhật $envFile" -ForegroundColor Green

# Update package.json build:prod script
$packageJsonPath = "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

# Escape URL for PowerShell
$escapedUrl = $ApiUrl -replace ':', '`:' -replace '/', '/'

$packageJson.scripts.'build:prod' = "set REACT_APP_API_BASE_URL=$escapedUrl && set REACT_APP_API_URL=$escapedUrl && set REACT_APP_GOOGLE_AUTH_URL=$escapedUrl/auth/google && set REACT_APP_SIMULATOR_WS_URL=wss://$($ApiUrl.Replace('https://', '')):8080 && react-scripts build"

$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
Write-Host "✅ Đã cập nhật package.json" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Hoàn thành! Bây giờ chạy:" -ForegroundColor Green
Write-Host "   npm run deploy" -ForegroundColor Yellow
