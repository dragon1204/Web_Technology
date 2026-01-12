# Script để test server từ Windows PowerShell

$SERVER_IP = "159.223.61.25"
$SERVER_PORT = "3000"
$BASE_URL = "http://${SERVER_IP}:${SERVER_PORT}"

Write-Host "🔍 Testing server at ${BASE_URL}..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Kiểm tra server có đang chạy không
Write-Host "1. Testing server connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "${BASE_URL}" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Server is responding" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server is not responding" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Checking PM2 status on server..." -ForegroundColor Yellow
    Write-Host "   SSH vào server và chạy: pm2 status" -ForegroundColor Gray
    exit 1
}

# Test 2: Kiểm tra health endpoint (nếu có)
Write-Host ""
Write-Host "2. Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "${BASE_URL}/health" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ Health endpoint: $($healthResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Health endpoint not found or not responding" -ForegroundColor Yellow
}

# Test 3: Kiểm tra API endpoint
Write-Host ""
Write-Host "3. Testing API endpoint..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "${BASE_URL}/api" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ API endpoint is accessible" -ForegroundColor Green
    Write-Host "   Response: $($apiResponse.Content.Substring(0, [Math]::Min(100, $apiResponse.Content.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "⚠️  API endpoint not accessible" -ForegroundColor Yellow
}

# Test 4: Test database connection (nếu có endpoint)
Write-Host ""
Write-Host "4. Testing database connection..." -ForegroundColor Yellow
try {
    $dbTest = Invoke-WebRequest -Uri "${BASE_URL}/api/health/db" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ Database connection: OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database health endpoint not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Server test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 To check server status on server:" -ForegroundColor Cyan
Write-Host "   ssh root@${SERVER_IP}" -ForegroundColor Gray
Write-Host "   pm2 status" -ForegroundColor Gray
Write-Host "   pm2 logs be-server" -ForegroundColor Gray
