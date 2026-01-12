#!/bin/bash
# Script đơn giản để reset và lấy password

DB_NAME="web_technology"
DB_USER="webtech_user"

# Generate password mới
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Reset password
sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$NEW_PASSWORD';"

# Tìm và sửa pg_hba.conf
PG_HBA_FILE=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)
if [ -n "$PG_HBA_FILE" ]; then
    cp "$PG_HBA_FILE" "$PG_HBA_FILE.backup"
    sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA_FILE"
    sed -i 's/local   all             all                                     scram-sha-256/local   all             all                                     md5/' "$PG_HBA_FILE"
    systemctl restart postgresql
fi

# Hiển thị password
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ DATABASE PASSWORD"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $NEW_PASSWORD"
echo ""
echo "DATABASE_URL:"
echo "postgresql://$DB_USER:$NEW_PASSWORD@localhost:5432/$DB_NAME?schema=public"
echo ""
echo "═══════════════════════════════════════════════════════════"
