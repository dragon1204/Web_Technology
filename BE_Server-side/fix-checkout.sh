#!/bin/bash

# Script để fix lỗi checkout 500

echo "🔍 Kiểm tra và sửa lỗi checkout..."
echo ""

# 1. Regenerate Prisma Client
echo "📦 Step 1: Regenerating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client regenerated"
echo ""

# 2. Check database migration
echo "📋 Step 2: Checking database migration status..."
npx prisma migrate status

echo ""
echo "⚠️  Nếu migration chưa được apply, chạy:"
echo "   psql -U your_user -d your_database -f apply-payment-fields-migration.sql"
echo ""

# 3. Restart backend
echo "🔄 Step 3: Restarting backend..."
if command -v pm2 &> /dev/null; then
    pm2 restart backend || pm2 restart all
    echo "✅ Backend restarted"
else
    echo "⚠️  PM2 not found. Please restart backend manually:"
    echo "   npm run start:prod"
fi

echo ""
echo "✅ Done! Please check backend logs if error persists:"
echo "   pm2 logs backend --lines 50"
