#!/bin/bash
# Script để chạy seed data trên server - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🌱 Starting database seed..."
echo ""

# Kiểm tra .env
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Kiểm tra DATABASE_URL
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ DATABASE_URL not found in .env!"
    exit 1
fi

echo "✅ Environment configured"
echo ""

# Chạy seed
echo "🌱 Seeding database..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database seeded successfully!"
    echo ""
    echo "📋 Default credentials:"
    echo "   Admin: admin@example.com / password123"
    echo "   User: user@example.com / password123"
else
    echo ""
    echo "❌ Seed failed! Check the error above."
    echo ""
    echo "💡 Alternative: Try running directly:"
    echo "   npx prisma db seed"
    echo "   or"
    echo "   npx ts-node prisma/seed.ts"
fi
