# PowerShell script to run database setup on server
# Usage: .\run-on-server.ps1

$SSH_HOST = "159.223.61.25"
$SSH_USER = "root"
$SSH_PASSWORD = "manhNPC7524web"

Write-Host "🚀 Connecting to server and installing database..." -ForegroundColor Green
Write-Host ""

# Read the quick-install script
$scriptContent = Get-Content -Path "quick-install-db.sh" -Raw

# Create a temporary script file on server via SSH
$remoteScript = @"
$scriptContent
"@

# Method 1: Using plink (PuTTY) - if available
if (Get-Command plink -ErrorAction SilentlyContinue) {
    Write-Host "📤 Uploading script to server..." -ForegroundColor Green
    
    # Create script on server
    $remoteScript | plink -ssh -pw $SSH_PASSWORD $SSH_USER@$SSH_HOST "cat > /tmp/install-db.sh && chmod +x /tmp/install-db.sh && /tmp/install-db.sh"
    
    Write-Host ""
    Write-Host "✅ Installation completed!" -ForegroundColor Green
} 
# Method 2: Manual instructions
else {
    Write-Host "⚠️  plink (PuTTY) not found. Please use one of these methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Method 1: SSH manually" -ForegroundColor Cyan
    Write-Host "  1. Open PowerShell or Git Bash" -ForegroundColor White
    Write-Host "  2. Run: ssh root@159.223.61.25" -ForegroundColor White
    Write-Host "  3. Copy and paste the content of quick-install-db.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "Method 2: Use WinSCP or FileZilla" -ForegroundColor Cyan
    Write-Host "  1. Upload quick-install-db.sh to /tmp/" -ForegroundColor White
    Write-Host "  2. SSH and run: chmod +x /tmp/quick-install-db.sh && /tmp/quick-install-db.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "Method 3: Install PuTTY" -ForegroundColor Cyan
    Write-Host "  Download from: https://www.putty.org/" -ForegroundColor White
    Write-Host "  Then run this script again" -ForegroundColor White
}
