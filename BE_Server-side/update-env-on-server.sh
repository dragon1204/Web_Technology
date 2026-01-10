#!/bin/bash
# Script để cập nhật .env trên server

SSH_HOST="159.223.61.25"
SSH_USER="root"
REMOTE_PATH="/var/web/Web_Technology/BE_Server-side"

# Database info
DB_USER="webtech_user"
DB_PASSWORD="y7MtdB9xIP11gB7yJOHg5Wrm5"
DB_NAME="web_technology"
DB_HOST="localhost"
DB_PORT="5432"

NEW_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

echo "📤 Updating .env file on server..."
echo ""

# SSH vào server và cập nhật
ssh ${SSH_USER}@${SSH_HOST} << EOF
cd ${REMOTE_PATH}

# Backup .env nếu tồn tại
if [ -f ".env" ]; then
    cp .env .env.backup
    echo "✅ Backed up existing .env to .env.backup"
fi

# Tạo hoặc cập nhật .env
cat > .env <<ENVFILE
# ============================================
# Database Configuration
# ============================================
DATABASE_URL="${NEW_DATABASE_URL}"

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
ENVFILE

chmod 600 .env

echo ""
echo "✅ .env file updated successfully!"
echo ""
echo "📋 Current DATABASE_URL:"
grep DATABASE_URL .env
echo ""
echo "📝 Next steps:"
echo "   1. Run: npx prisma generate"
echo "   2. Run: npx prisma migrate deploy"
echo "   3. (Optional) Run: npm run db:seed"
EOF

echo ""
echo "✅ Done!"
