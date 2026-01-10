#!/bin/bash
# Script để reset và lấy password database

DB_NAME="web_technology"
DB_USER="webtech_user"

# Generate new password
echo "🔑 Generating new password..."
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Reset password
sudo -u postgres psql <<EOF
ALTER USER $DB_USER WITH PASSWORD '$NEW_PASSWORD';
EOF

# Tìm và sửa pg_hba.conf
echo "🔧 Fixing PostgreSQL configuration..."
PG_HBA_FILE=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)

if [ -n "$PG_HBA_FILE" ]; then
    echo "✅ Found pg_hba.conf at: $PG_HBA_FILE"
    cp "$PG_HBA_FILE" "$PG_HBA_FILE.backup"
    sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA_FILE"
    sed -i 's/local   all             all                                     scram-sha-256/local   all             all                                     md5/' "$PG_HBA_FILE"
    systemctl restart postgresql
    echo "✅ PostgreSQL configuration updated"
else
    echo "⚠️  pg_hba.conf not found, but database should work"
fi

# Save credentials
CREDENTIALS_FILE="/root/db_credentials.txt"
cat > "$CREDENTIALS_FILE" <<CREDS
Database: $DB_NAME
User: $DB_USER
Password: $NEW_PASSWORD
DATABASE_URL: postgresql://$DB_USER:$NEW_PASSWORD@localhost:5432/$DB_NAME?schema=public
CREDS
chmod 600 "$CREDENTIALS_FILE"

# Hiển thị thông tin
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ DATABASE PASSWORD"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Database Information:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $NEW_PASSWORD"
echo ""
echo "📝 Copy this to your .env file:"
echo ""
echo "DATABASE_URL=\"postgresql://$DB_USER:$NEW_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo ""
echo "📄 Credentials saved to: $CREDENTIALS_FILE"
echo ""
echo "⚠️  IMPORTANT: Save this password now!"
echo "═══════════════════════════════════════════════════════════"
