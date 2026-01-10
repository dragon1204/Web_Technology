#!/bin/bash
# Script để đồng bộ schema trên server - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🔍 Checking database schema on server..."
echo ""

# 1. Kiểm tra các cột trong bảng Garden
echo "1. Checking Garden table columns..."
psql -U webtech_user -d web_technology -h localhost -c "\d \"Garden\"" 2>/dev/null || echo "Cannot connect"

echo ""
echo "2. Adding missing columns..."

# Thêm các cột còn thiếu
psql -U webtech_user -d web_technology -h localhost <<EOF
-- Tạo enum nếu chưa có
DO \$\$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PumpControlMode') THEN
        CREATE TYPE "PumpControlMode" AS ENUM ('AUTO', 'ON', 'OFF');
    END IF;
END \$\$;

-- Thêm pumpControl
DO \$\$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Garden' AND column_name = 'pumpControl'
    ) THEN
        ALTER TABLE "Garden" ADD COLUMN "pumpControl" "PumpControlMode" DEFAULT 'AUTO';
    END IF;
END \$\$;

-- Thêm deviceMac nếu thiếu
DO \$\$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Garden' AND column_name = 'deviceMac'
    ) THEN
        ALTER TABLE "Garden" ADD COLUMN "deviceMac" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "Garden_deviceMac_key" ON "Garden"("deviceMac");
    END IF;
END \$\$;

-- Thêm các cột sensor nếu thiếu
DO \$\$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Garden' AND column_name = 'temperature') THEN
        ALTER TABLE "Garden" ADD COLUMN "temperature" DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Garden' AND column_name = 'humidity') THEN
        ALTER TABLE "Garden" ADD COLUMN "humidity" DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Garden' AND column_name = 'soil') THEN
        ALTER TABLE "Garden" ADD COLUMN "soil" DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Garden' AND column_name = 'timestamp') THEN
        ALTER TABLE "Garden" ADD COLUMN "timestamp" TIMESTAMP(3);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Garden' AND column_name = 'createdAt') THEN
        ALTER TABLE "Garden" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Garden' AND column_name = 'updatedAt') THEN
        ALTER TABLE "Garden" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END \$\$;
EOF

echo ""
echo "3. Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Schema sync complete!"
echo ""
echo "📝 Now try running seed again:"
echo "   npm run db:seed"
