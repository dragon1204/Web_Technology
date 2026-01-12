#!/bin/bash
# Script để kiểm tra cấu hình PostgreSQL - Copy và paste vào SSH terminal

echo "🔍 Verifying PostgreSQL remote configuration..."
echo ""

# 1. Kiểm tra listen_addresses
echo "1. Checking listen_addresses..."
PG_CONF="/etc/postgresql/16/main/postgresql.conf"
if grep -q "^listen_addresses = '\*'" "$PG_CONF" || grep -q "^listen_addresses = '*'" "$PG_CONF"; then
    echo "✅ listen_addresses is set to '*'"
else
    echo "❌ listen_addresses is NOT set correctly"
    grep "^listen_addresses" "$PG_CONF" || echo "   Not found in config"
fi

# 2. Kiểm tra pg_hba.conf
echo ""
echo "2. Checking pg_hba.conf for remote access..."
PG_HBA="/etc/postgresql/16/main/pg_hba.conf"
if grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_HBA"; then
    echo "✅ Remote access rule exists"
    grep "host.*all.*all.*0.0.0.0/0.*md5" "$PG_HBA"
else
    echo "❌ Remote access rule NOT found"
fi

# 3. Kiểm tra PostgreSQL đang listen
echo ""
echo "3. Checking if PostgreSQL is listening on port 5432..."
if netstat -tlnp 2>/dev/null | grep -q ":5432" || ss -tlnp 2>/dev/null | grep -q ":5432"; then
    echo "✅ PostgreSQL is listening on port 5432"
    netstat -tlnp 2>/dev/null | grep ":5432" || ss -tlnp 2>/dev/null | grep ":5432"
else
    echo "❌ PostgreSQL is NOT listening on port 5432"
fi

# 4. Kiểm tra firewall
echo ""
echo "4. Checking firewall..."
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "5432/tcp"; then
        echo "✅ Firewall rule exists for port 5432"
    else
        echo "⚠️  Firewall rule NOT found for port 5432"
    fi
else
    echo "⚠️  UFW not available"
fi

# 5. Kiểm tra PostgreSQL service
echo ""
echo "5. Checking PostgreSQL service status..."
systemctl status postgresql --no-pager | head -5

echo ""
echo "📝 Test connection from your local machine with:"
echo "postgresql://webtech_user:y7MtdB9xIP11gB7yJOHg5Wrm5@159.223.61.25:5432/web_technology?schema=public"
