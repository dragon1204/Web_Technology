#!/bin/bash
# Script đơn giản để seed - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Done!"
