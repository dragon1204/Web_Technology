#!/bin/bash
# Script để tìm đúng đường dẫn file config PostgreSQL - Copy và paste vào SSH terminal

echo "🔍 Finding PostgreSQL configuration files..."
echo ""

# Tìm file postgresql.conf
echo "1. Looking for postgresql.conf..."
PG_CONF=$(find /etc/postgresql -name postgresql.conf 2>/dev/null | head -1)
if [ -n "$PG_CONF" ]; then
    echo "✅ Found: $PG_CONF"
else
    echo "❌ Not found in /etc/postgresql"
    # Thử tìm ở các vị trí khác
    PG_CONF=$(find /var/lib/postgresql -name postgresql.conf 2>/dev/null | head -1)
    if [ -n "$PG_CONF" ]; then
        echo "✅ Found: $PG_CONF"
    else
        echo "❌ Not found"
    fi
fi

echo ""
echo "2. Looking for pg_hba.conf..."
PG_HBA=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)
if [ -n "$PG_HBA" ]; then
    echo "✅ Found: $PG_HBA"
else
    echo "❌ Not found in /etc/postgresql"
    # Thử tìm ở các vị trí khác
    PG_HBA=$(find /var/lib/postgresql -name pg_hba.conf 2>/dev/null | head -1)
    if [ -n "$PG_HBA" ]; then
        echo "✅ Found: $PG_HBA"
    else
        echo "❌ Not found"
    fi
fi

echo ""
echo "3. PostgreSQL data directory:"
sudo -u postgres psql -c "SHOW data_directory;" 2>/dev/null || echo "Cannot determine"

echo ""
echo "4. PostgreSQL version and cluster:"
pg_lsclusters

echo ""
if [ -n "$PG_CONF" ] && [ -n "$PG_HBA" ]; then
    echo "📝 Use these paths:"
    echo "   PG_CONF=\"$PG_CONF\""
    echo "   PG_HBA=\"$PG_HBA\""
fi
