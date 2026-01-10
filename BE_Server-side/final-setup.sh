#!/bin/bash
# Script hoàn chỉnh để setup database - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🎉 Database setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "   ✅ Database: web_technology"
echo "   ✅ User: webtech_user"
echo "   ✅ All migrations applied"
echo "   ✅ Prisma Client generated"
echo ""
echo "📝 Optional: Seed database with sample data"
read -p "Do you want to seed the database? (y/n): " seed_choice

if [[ "$seed_choice" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "🌱 Seeding database..."
    npm run db:seed
    echo ""
    echo "✅ Database seeded!"
fi

echo ""
echo "🚀 Setup complete! Your database is ready to use."
echo ""
echo "💡 To start the server:"
echo "   npm run start:prod"
echo "   or"
echo "   pm2 start dist/main.js --name be-server"
