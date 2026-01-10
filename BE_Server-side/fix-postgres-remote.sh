#!/bin/bash
# Script để cấu hình PostgreSQL cho remote connection - Copy và paste vào SSH terminal

echo "🔍 Finding PostgreSQL configuration..."

# Tìm file config
PG_CONF=$(find /etc/postgresql -name postgresql.conf 2>/dev/null | head -1)
PG_HBA=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)

# Nếu không tìm thấy, thử tìm trong data directory
if [ -z "$PG_CONF" ]; then
    DATA_DIR=$(sudo -u postgres psql -t -c "SHOW data_directory;" 2>/dev/null | xargs)
    if [ -n "$DATA_DIR" ]; then
        PG_CONF="$DATA_DIR/postgresql.conf"
        PG_HBA="$DATA_DIR/pg_hba.conf"
    fi
fi

# Nếu vẫn không tìm thấy, dùng pg_lsclusters
if [ -z "$PG_CONF" ] || [ ! -f "$PG_CONF" ]; then
    echo "Using pg_lsclusters to find config..."
    CLUSTER=$(pg_lsclusters | grep "16" | head -1 | awk '{print $1"/"$2}')
    if [ -n "$CLUSTER" ]; then
        PG_CONF="/etc/postgresql/$CLUSTER/postgresql.conf"
        PG_HBA="/etc/postgresql/$CLUSTER/pg_hba.conf"
    fi
fi

echo "PG_CONF: $PG_CONF"
echo "PG_HBA: $PG_HBA"
echo ""

if [ ! -f "$PG_CONF" ] || [ ! -f "$PG_HBA" ]; then
    echo "❌ Configuration files not found!"
    echo ""
    echo "Trying alternative method..."
    pg_lsclusters
    echo ""
    echo "Please run: find /etc/postgresql -name postgresql.conf"
    exit 1
fi

# Backup
echo "📦 Backing up files..."
cp "$PG_CONF" "$PG_CONF.backup.$(date +%Y%m%d_%H%M%S)"
cp "$PG_HBA" "$PG_HBA.backup.$(date +%Y%m%d_%H%M%S)"

# Enable remote connections
echo "🔧 Configuring postgresql.conf..."
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
sed -i "s/^listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
sed -i "s/^#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"

# Add remote access rule
echo "🔧 Configuring pg_hba.conf..."
if ! grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_HBA"; then
    echo "" >> "$PG_HBA"
    echo "# Allow remote connections" >> "$PG_HBA"
    echo "host    all             all             0.0.0.0/0               md5" >> "$PG_HBA"
    echo "✅ Added remote connection rule"
else
    echo "⚠️  Remote connection rule already exists"
fi

# Restart
echo ""
echo "🔄 Restarting PostgreSQL..."
systemctl restart postgresql

# Check status
echo ""
echo "📊 PostgreSQL status:"
systemctl status postgresql --no-pager | head -3

# Firewall
echo ""
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 5432/tcp
    echo "✅ Firewall rule added"
fi

echo ""
echo "✅ PostgreSQL configured for remote connections!"
echo ""
echo "📝 Connection URL:"
echo "postgresql://webtech_user:y7MtdB9xIP11gB7yJOHg5Wrm5@159.223.61.25:5432/web_technology?schema=public"
