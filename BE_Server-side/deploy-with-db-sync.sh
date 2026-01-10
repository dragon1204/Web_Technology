#!/bin/bash
# Script để deploy code và đồng bộ database - Chạy trên server sau khi pull code

cd /var/web/Web_Technology/BE_Server-side

echo "🚀 Deploying and syncing database..."
echo ""

# 1. Pull latest code (nếu dùng git)
if [ -d ".git" ]; then
    echo "1. Pulling latest code..."
    git pull origin main || git pull origin fix/database-setup
fi

# 2. Install dependencies
echo ""
echo "2. Installing dependencies..."
npm install

# 3. Generate Prisma Client
echo ""
echo "3. Generating Prisma Client..."
npx prisma generate

# 4. Sync database schema
echo ""
echo "4. Syncing database schema..."
echo "   Option A: Using migrations (recommended for production)"
npx prisma migrate deploy

echo ""
echo "   Option B: Push schema directly (faster, but less safe)"
echo "   Uncomment the line below if you want to use db push instead:"
echo "   # npx prisma db push"

# 5. Build application
echo ""
echo "5. Building application..."
npm run build

# 6. Restart application (if using PM2)
echo ""
if command -v pm2 &> /dev/null; then
    echo "6. Restarting application with PM2..."
    pm2 restart be-server || pm2 start dist/main.js --name be-server
    pm2 save
else
    echo "6. PM2 not found. Please restart your application manually."
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Optional: Seed database"
echo "   npm run db:seed"
