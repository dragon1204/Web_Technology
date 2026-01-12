#!/bin/bash
# Script đơn giản để fix migration - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

# Đánh dấu migration đã apply (vì enum Role đã tồn tại từ migration trước)
npx prisma migrate resolve --applied 20260105172603_init_database

echo ""
echo "✅ Migration resolved!"
echo ""
echo "📝 Running migrations again..."
npx prisma migrate deploy
