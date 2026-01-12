#!/bin/bash
# Script để kiểm tra database sau khi migrations - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🔍 Verifying database setup..."
echo ""

# Kiểm tra kết nối database
echo "1. Testing database connection..."
npx prisma db execute --stdin <<< "SELECT version();" || echo "⚠️  Connection test failed"

echo ""
echo "2. Checking tables..."
npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" || echo "⚠️  Table check failed"

echo ""
echo "3. Checking Prisma Client..."
npx prisma generate

echo ""
echo "✅ Database verification complete!"
echo ""
echo "📝 Next steps (optional):"
echo "   - Run seed: npm run db:seed"
echo "   - Start server: npm run start:prod"
echo "   - Or use PM2: pm2 start dist/main.js --name be-server"
