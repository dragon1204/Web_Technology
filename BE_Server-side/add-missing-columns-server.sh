#!/bin/bash
# Script để thêm các cột còn thiếu vào database - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🔧 Adding missing columns to database..."
echo ""

# Tạo enum PumpControlMode nếu chưa có
echo "1. Creating PumpControlMode enum..."
psql -U webtech_user -d web_technology -h localhost <<EOF
DO \$\$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PumpControlMode') THEN
        CREATE TYPE "PumpControlMode" AS ENUM ('AUTO', 'ON', 'OFF');
        RAISE NOTICE 'PumpControlMode enum created';
    ELSE
        RAISE NOTICE 'PumpControlMode enum already exists';
    END IF;
END \$\$;
EOF

# Thêm cột pumpControl vào bảng Garden
echo ""
echo "2. Adding pumpControl column to Garden table..."
psql -U webtech_user -d web_technology -h localhost <<EOF
DO \$\$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Garden' 
        AND column_name = 'pumpControl'
    ) THEN
        ALTER TABLE "Garden" 
        ADD COLUMN "pumpControl" "PumpControlMode" DEFAULT 'AUTO';
        RAISE NOTICE 'pumpControl column added';
    ELSE
        RAISE NOTICE 'pumpControl column already exists';
    END IF;
END \$\$;
EOF

# Kiểm tra các cột khác có thể thiếu
echo ""
echo "3. Checking for other missing columns..."

psql -U webtech_user -d web_technology -h localhost <<EOF
DO \$\$ 
BEGIN
    -- deviceMac
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Garden' AND column_name = 'deviceMac'
    ) THEN
        ALTER TABLE "Garden" ADD COLUMN "deviceMac" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "Garden_deviceMac_key" ON "Garden"("deviceMac");
        RAISE NOTICE 'deviceMac column added';
    END IF;

    -- temperature
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Garden' AND column_name = 'temperature'
    ) THEN
        ALTER TABLE "Garden" ADD COLUMN "temperature" DOUBLE PRECISION;
        RAISE NOTICE 'temperature column added';
    END IF;

    -- humidity
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Garden' AND column_name = 'humidity'
    ) THEN
        ALTER TABLE "Garden" ADD COLUMN "humidity" DOUBLE PRECISION;
        RAISE NOTICE 'humidity column added';
    END IF;

    -- soil
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Garden' AND column_name = 'soil'
    ) THEN
        ALTER TABLE "Garden" ADD COLUMN "soil" DOUBLE PRECISION;
        RAISE NOTICE 'soil column added';
    END IF;

    -- timestamp
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Garden' AND column_name = 'timestamp'
    ) THEN
        ALTER TABLE "Garden" ADD COLUMN "timestamp" TIMESTAMP(3);
        RAISE NOTICE 'timestamp column added';
    END IF;

    -- createdAt
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Garden' AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE "Garden" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'createdAt column added';
    END IF;

    -- updatedAt
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Garden' AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE "Garden" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'updatedAt column added';
    END IF;
END \$\$;
EOF

echo ""
echo "✅ Missing columns added!"
echo ""
echo "📝 Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Done! Try running seed again:"
echo "   npm run db:seed"
