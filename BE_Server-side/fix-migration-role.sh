#!/bin/bash
# Script để sửa lỗi migration - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🔧 Fixing migration issue..."

# Option 1: Mark migration as applied (nếu database đã có đủ schema)
echo "Option 1: Marking migration as applied..."
npx prisma migrate resolve --applied 20260105172603_init_database

if [ $? -eq 0 ]; then
    echo "✅ Migration marked as applied"
    echo ""
    echo "📝 Try running migrations again:"
    echo "   npx prisma migrate deploy"
else
    echo ""
    echo "⚠️  Option 1 failed. Trying Option 2..."
    echo ""
    
    # Option 2: Sửa migration file để bỏ qua enum đã tồn tại
    echo "Option 2: Fixing migration file..."
    
    MIGRATION_FILE="prisma/migrations/20260105172603_init_database/migration.sql"
    
    if [ -f "$MIGRATION_FILE" ]; then
        # Backup
        cp "$MIGRATION_FILE" "$MIGRATION_FILE.backup"
        
        # Sửa CREATE TYPE thành CREATE TYPE IF NOT EXISTS
        sed -i 's/CREATE TYPE "Role"/DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '\''Role'\'') THEN CREATE TYPE "Role"/' "$MIGRATION_FILE"
        sed -i '/CREATE TYPE "Role"/a END IF; END $$;' "$MIGRATION_FILE"
        
        sed -i 's/CREATE TYPE "PumpControlMode"/DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '\''PumpControlMode'\'') THEN CREATE TYPE "PumpControlMode"/' "$MIGRATION_FILE"
        sed -i '/CREATE TYPE "PumpControlMode"/a END IF; END $$;' "$MIGRATION_FILE"
        
        echo "✅ Migration file fixed"
        echo ""
        echo "📝 Try running migrations again:"
        echo "   npx prisma migrate deploy"
    else
        echo "❌ Migration file not found"
        echo ""
        echo "Option 3: Skip this migration and continue"
        echo "   npx prisma migrate resolve --rolled-back 20260105172603_init_database"
        echo "   npx prisma migrate deploy"
    fi
fi
