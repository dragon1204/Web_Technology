#!/bin/bash
# Copy và paste script này vào SSH terminal để cập nhật .env trên server

cat > /var/web/Web_Technology/BE_Server-side/.env << 'ENVFILE'
# DATABASE
DATABASE_URL="postgresql://webtech_user:y7MtdB9xIP11gB7yJOHg5Wrm5@localhost:5432/web_technology?schema=public"

# JWT secret 
JWT_SECRET="Long1204@"
JWT_REFRESH_SECRET="Long1204@"
MQTT_URL="mqtt://broker.hivemq.com:1883"
#PORT
PORT=3000

# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
ENVFILE

chmod 600 /var/web/Web_Technology/BE_Server-side/.env

echo "✅ .env file updated successfully!"
echo ""
echo "📋 DATABASE_URL:"
grep DATABASE_URL /var/web/Web_Technology/BE_Server-side/.env
echo ""
echo "📝 Next steps:"
echo "   1. cd /var/web/Web_Technology/BE_Server-side"
echo "   2. npx prisma generate"
echo "   3. npx prisma migrate deploy"
