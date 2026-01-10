#!/bin/bash
# Script đơn giản - Copy và paste vào SSH terminal

PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1,2)
PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

# Backup
cp "$PG_CONF" "$PG_CONF.backup"
cp "$PG_HBA" "$PG_HBA.backup"

# Enable remote connections
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
sed -i "s/^listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"

# Add remote access rule
if ! grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_HBA"; then
    echo "" >> "$PG_HBA"
    echo "host    all             all             0.0.0.0/0               md5" >> "$PG_HBA"
fi

# Restart
systemctl restart postgresql

# Firewall
ufw allow 5432/tcp 2>/dev/null || echo "UFW not available"

echo "✅ PostgreSQL configured for remote connections!"
echo ""
echo "Connection URL:"
echo "postgresql://webtech_user:y7MtdB9xIP11gB7yJOHg5Wrm5@159.223.61.25:5432/web_technology?schema=public"
