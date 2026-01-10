# PowerShell script to update .env on server
$SSH_HOST = "159.223.61.25"
$SSH_USER = "root"
$SSH_PASSWORD = "manhNPC7524web"
$REMOTE_PATH = "/var/web/Web_Technology/BE_Server-side"

$DB_USER = "webtech_user"
$DB_PASSWORD = "y7MtdB9xIP11gB7yJOHg5Wrm5"
$DB_NAME = "web_technology"
$NEW_DATABASE_URL = "postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

Write-Host "📤 Updating .env file on server..." -ForegroundColor Green
Write-Host ""

# Create the .env content
$envContent = @"
# ============================================
# Database Configuration
# ============================================
DATABASE_URL="$NEW_DATABASE_URL"

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET="Long1204@"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# ============================================
# Google OAuth (Optional)
# ============================================
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ============================================
# MQTT Configuration (Cho IoT Devices)
# ============================================
# MQTT_URL="mqtt://broker-url:1883"
# MQTT_USERNAME="mqtt-username"
# MQTT_PASSWORD="mqtt-password"

# ============================================
# Server Configuration
# ============================================
PORT=3000
NODE_ENV=production

# ============================================
# CORS Configuration (Optional)
# ============================================
# CORS_ORIGIN="https://yourdomain.com"
"@

# Save to temporary file
$tempFile = [System.IO.Path]::GetTempFileName()
$envContent | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "Uploading .env file..." -ForegroundColor Cyan

# Try using scp
if (Get-Command scp -ErrorAction SilentlyContinue) {
    # Upload file
    scp $tempFile "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/.env"
    
    if ($LASTEXITCODE -eq 0) {
        # Set permissions
        ssh "${SSH_USER}@${SSH_HOST}" "chmod 600 ${REMOTE_PATH}/.env"
        
        Write-Host ""
        Write-Host ".env file updated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "   1. SSH: ssh root@159.223.61.25" -ForegroundColor White
        Write-Host "   2. Run: cd $REMOTE_PATH" -ForegroundColor White
        Write-Host "   3. Run: npx prisma generate" -ForegroundColor White
        Write-Host "   4. Run: npx prisma migrate deploy" -ForegroundColor White
    }
}
# Try using plink/pscp
elseif (Get-Command pscp -ErrorAction SilentlyContinue) {
    echo y | pscp -pw $SSH_PASSWORD $tempFile "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/.env"
    
    if ($LASTEXITCODE -eq 0) {
        echo y | plink -ssh -pw $SSH_PASSWORD $SSH_USER@$SSH_HOST "chmod 600 ${REMOTE_PATH}/.env"
        Write-Host ""
        Write-Host ".env file updated successfully!" -ForegroundColor Green
    }
}
else {
    Write-Host "SSH tools not found. Please run this command manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ssh root@159.223.61.25" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then paste this content:" -ForegroundColor Yellow
    Write-Host $envContent -ForegroundColor White
}

# Clean up
Remove-Item $tempFile -ErrorAction SilentlyContinue
