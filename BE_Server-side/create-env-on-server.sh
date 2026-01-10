#!/bin/bash
# Script để tạo .env trên server - Copy và paste vào SSH terminal

cat > /var/web/Web_Technology/BE_Server-side/.env << 'ENVFILE'
# ============================================
# Database Configuration
# ============================================
DATABASE_URL="postgresql://webtech_user:y7MtdB9xIP11gB7yJOHg5Wrm5@localhost:5432/web_technology?schema=public"

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET="Long1204@"
JWT_REFRESH_SECRET="Long1204@"

# ============================================
# Google OAuth (Optional - Add your credentials)
# ============================================
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ============================================
# MQTT Configuration (Cho IoT Devices)
# ============================================
MQTT_URL="mqtt://broker.hivemq.com:1883"

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

chmod 600 /var/web/Web_Technology/BE_Server-side/.env

echo "✅ .env file created successfully!"
echo ""
echo "📋 DATABASE_URL:"
grep DATABASE_URL /var/web/Web_Technology/BE_Server-side/.env
echo ""
echo "📝 Next steps:"
echo "   1. cd /var/web/Web_Technology/BE_Server-side"
echo "   2. npx prisma generate"
echo "   3. npx prisma migrate deploy"
