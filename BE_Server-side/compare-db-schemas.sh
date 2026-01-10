#!/bin/bash
# Script để so sánh schema giữa local và server - Copy và paste vào SSH terminal

echo "🔍 Comparing database schemas..."
echo ""

# Trên server
echo "📊 Server Database Schema:"
echo "================================"
cd /var/web/Web_Technology/BE_Server-side
npx prisma db pull --print 2>/dev/null | head -50 || echo "Cannot pull schema from server"

echo ""
echo "📋 Server Tables:"
psql -U webtech_user -d web_technology -h localhost -c "\dt" 2>/dev/null || echo "Cannot connect to server DB"

echo ""
echo "💡 To compare with local:"
echo "   1. On local machine, run: npx prisma db pull"
echo "   2. Compare prisma/schema.prisma files"
echo "   3. Or use: npx prisma migrate diff"
