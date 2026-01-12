#!/bin/bash
# Script để đồng bộ schema từ Prisma schema file - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🔄 Syncing database schema with Prisma schema..."
echo ""

# Kiểm tra migrations
echo "1. Checking migration status..."
npx prisma migrate status

echo ""
echo "2. Applying any pending migrations..."
npx prisma migrate deploy

echo ""
echo "3. Generating Prisma Client..."
npx prisma generate

echo ""
echo "4. Pulling current schema from database..."
npx prisma db pull --force

echo ""
echo "✅ Schema sync complete!"
echo ""
echo "📝 If schemas are still different, you may need to:"
echo "   - Create a new migration: npx prisma migrate dev --name sync_schema"
echo "   - Or manually fix differences in the database"
