#!/bin/bash
# Script để cấu hình PostgreSQL cho phép kết nối từ xa - Copy và paste vào SSH terminal

echo "🔧 Configuring PostgreSQL for remote connections..."

# Tìm version PostgreSQL
PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1,2)
echo "PostgreSQL version: $PG_VERSION"

# Đường dẫn file config
PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

# Backup files
echo "📦 Backing up configuration files..."
cp "$PG_CONF" "$PG_CONF.backup.$(date +%Y%m%d_%H%M%S)"
cp "$PG_HBA" "$PG_HBA.backup.$(date +%Y%m%d_%H%M%S)"

# 1. Cấu hình postgresql.conf để listen trên tất cả interfaces
echo ""
echo "1. Configuring postgresql.conf..."
if grep -q "^listen_addresses" "$PG_CONF"; then
    # Uncomment và set thành '*'
    sed -i "s/^#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
    sed -i "s/^listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
    echo "✅ Updated listen_addresses"
else
    echo "listen_addresses = '*'" >> "$PG_CONF"
    echo "✅ Added listen_addresses"
fi

# 2. Cấu hình pg_hba.conf để cho phép kết nối từ xa
echo ""
echo "2. Configuring pg_hba.conf..."

# Kiểm tra xem đã có rule cho remote connection chưa
if ! grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_HBA"; then
    # Thêm rule cho phép kết nối từ mọi IP với md5 authentication
    echo "" >> "$PG_HBA"
    echo "# Allow remote connections" >> "$PG_HBA"
    echo "host    all             all             0.0.0.0/0               md5" >> "$PG_HBA"
    echo "✅ Added remote connection rule"
else
    echo "⚠️  Remote connection rule already exists"
fi

# 3. Restart PostgreSQL
echo ""
echo "3. Restarting PostgreSQL..."
systemctl restart postgresql

# 4. Kiểm tra status
echo ""
echo "4. Checking PostgreSQL status..."
systemctl status postgresql --no-pager | head -5

# 5. Kiểm tra port đang listen
echo ""
echo "5. Checking if PostgreSQL is listening on port 5432..."
netstat -tlnp | grep 5432 || ss -tlnp | grep 5432

# 6. Cấu hình firewall (nếu có ufw)
echo ""
if command -v ufw &> /dev/null; then
    echo "6. Configuring firewall..."
    ufw allow 5432/tcp
    echo "✅ Firewall rule added"
else
    echo "6. UFW not found, skipping firewall configuration"
    echo "   If you have another firewall, please allow port 5432 manually"
fi

echo ""
echo "✅ PostgreSQL configured for remote connections!"
echo ""
echo "📝 Connection URL from your local machine:"
echo "postgresql://webtech_user:y7MtdB9xIP11gB7yJOHg5Wrm5@159.223.61.25:5432/web_technology?schema=public"
echo ""
echo "⚠️  Security Note:"
echo "   - Only allow remote connections if necessary"
echo "   - Consider using SSH tunnel for better security"
echo "   - Or restrict IP addresses in pg_hba.conf instead of 0.0.0.0/0"
