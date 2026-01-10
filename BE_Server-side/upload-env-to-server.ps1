# PowerShell script to upload .env file to server
# Usage: .\upload-env-to-server.ps1

$SSH_HOST = "159.223.61.25"
$SSH_USER = "root"
$SSH_PASSWORD = "manhNPC7524web"
$REMOTE_PATH = "/var/web/Web_Technology/BE_Server-side"
$LOCAL_ENV_FILE = ".env"

Write-Host "📤 Uploading .env file to server..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path $LOCAL_ENV_FILE)) {
    Write-Host "❌ File .env not found in current directory!" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found .env file" -ForegroundColor Green
Write-Host ""

# Method 1: Using scp (if available)
if (Get-Command scp -ErrorAction SilentlyContinue) {
    Write-Host "📤 Uploading via SCP..." -ForegroundColor Cyan
    
    # Create remote directory if it doesn't exist
    ssh "$SSH_USER@$SSH_HOST" "mkdir -p $REMOTE_PATH" 2>$null
    
    # Upload file
    scp $LOCAL_ENV_FILE "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/.env"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ File uploaded successfully!" -ForegroundColor Green
        
        # Set permissions
        ssh "$SSH_USER@$SSH_HOST" "chmod 600 $REMOTE_PATH/.env"
        
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. SSH into server: ssh root@159.223.61.25" -ForegroundColor White
        Write-Host "   2. Verify file: cat $REMOTE_PATH/.env" -ForegroundColor White
        Write-Host "   3. Run migrations: cd $REMOTE_PATH && npx prisma generate && npx prisma migrate deploy" -ForegroundColor White
    } else {
        Write-Host "❌ Upload failed!" -ForegroundColor Red
    }
}
# Method 2: Using plink (PuTTY)
elseif (Get-Command plink -ErrorAction SilentlyContinue) {
    Write-Host "📤 Uploading via PuTTY (plink)..." -ForegroundColor Cyan
    
    # Upload using pscp
    if (Get-Command pscp -ErrorAction SilentlyContinue) {
        echo y | pscp -pw $SSH_PASSWORD $LOCAL_ENV_FILE "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/.env"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ File uploaded successfully!" -ForegroundColor Green
            
            # Set permissions
            echo y | plink -ssh -pw $SSH_PASSWORD $SSH_USER@$SSH_HOST "chmod 600 $REMOTE_PATH/.env"
        }
    } else {
        Write-Host "❌ pscp not found. Please install PuTTY: https://www.putty.org/" -ForegroundColor Red
    }
}
# Method 3: Manual instructions
else {
    Write-Host "⚠️  SSH/SCP tools not found. Please use one of these methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Method 1: Use WinSCP or FileZilla" -ForegroundColor Cyan
    Write-Host "   1. Connect to: $SSH_HOST" -ForegroundColor White
    Write-Host "   2. Username: $SSH_USER" -ForegroundColor White
    Write-Host "   3. Password: $SSH_PASSWORD" -ForegroundColor White
    Write-Host "   4. Upload .env to: $REMOTE_PATH" -ForegroundColor White
    Write-Host ""
    Write-Host "Method 2: Copy content manually" -ForegroundColor Cyan
    Write-Host "   1. SSH: ssh root@159.223.61.25" -ForegroundColor White
    Write-Host "   2. Create file: nano $REMOTE_PATH/.env" -ForegroundColor White
    Write-Host "   3. Paste content from .env file" -ForegroundColor White
    Write-Host "   4. Save: Ctrl+X, Y, Enter" -ForegroundColor White
    Write-Host "   5. Set permissions: chmod 600 $REMOTE_PATH/.env" -ForegroundColor White
    Write-Host ""
    Write-Host "Method 3: Install OpenSSH (Windows 10+)" -ForegroundColor Cyan
    Write-Host "   Run: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor White
}
