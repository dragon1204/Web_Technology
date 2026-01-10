# PowerShell script to deploy database setup to server
# For Windows users

$SSH_HOST = "159.223.61.25"
$SSH_USER = "root"
$SSH_PASSWORD = "manhNPC7524web"
$REMOTE_PATH = "/var/web/Web_Technology/BE_Server-side"

Write-Host "🚀 Deploying database setup to server..." -ForegroundColor Green
Write-Host ""

# Check if plink (PuTTY) or ssh is available
$hasSSH = Get-Command ssh -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue

if (-not $hasSSH -and -not $hasPlink) {
    Write-Host "❌ SSH client not found. Please install:" -ForegroundColor Red
    Write-Host "   - OpenSSH (Windows 10+): Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor Yellow
    Write-Host "   - Or install PuTTY: https://www.putty.org/" -ForegroundColor Yellow
    exit 1
}

# Function to run SSH command
function Invoke-SSHCommand {
    param(
        [string]$Command
    )
    
    if ($hasSSH) {
        # Use ssh with sshpass equivalent (expect script)
        $expectScript = @"
spawn ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST
expect "password:"
send "$SSH_PASSWORD\r"
expect "# "
send "$Command\r"
expect "# "
send "exit\r"
"@
        echo $expectScript | expect
    } else {
        # Use plink
        echo y | plink -ssh -pw $SSH_PASSWORD $SSH_USER@$SSH_HOST $Command
    }
}

# Upload setup-db.sh
Write-Host "📤 Uploading setup script to server..." -ForegroundColor Green
if ($hasSSH) {
    # Use scp with expect
    $scpScript = @"
spawn scp -o StrictHostKeyChecking=no setup-db.sh $SSH_USER@$SSH_HOST`:$REMOTE_PATH/
expect "password:"
send "$SSH_PASSWORD\r"
expect eof
"@
    echo $scpScript | expect
} else {
    # Use pscp (PuTTY)
    echo y | pscp -pw $SSH_PASSWORD setup-db.sh $SSH_USER@$SSH_HOST`:$REMOTE_PATH/
}

# Run setup script
Write-Host "🔧 Running database setup on server..." -ForegroundColor Green
$setupCommand = "cd $REMOTE_PATH && chmod +x setup-db.sh && ./setup-db.sh"
Invoke-SSHCommand -Command $setupCommand

Write-Host ""
Write-Host "✅ Database setup completed on server!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. SSH into server: ssh root@159.223.61.25"
Write-Host "   2. Check .env file in $REMOTE_PATH"
Write-Host "   3. Run migrations: cd $REMOTE_PATH && npx prisma migrate deploy"
Write-Host "   4. (Optional) Run seed: npm run db:seed"
Write-Host ""
