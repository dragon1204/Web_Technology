#!/bin/bash
# Script để sửa lỗi và lấy password

set -e

echo "🔧 Fixing PostgreSQL configuration and retrieving password..."

DB_NAME="web_technology"
DB_USER="webtech_user"

# Tìm đúng đường dẫn pg_hba.conf
PG_HBA_PATHS=(
    "/etc/postgresql/16/main/pg_hba.conf"
    "/etc/postgresql/16.11/main/pg_hba.conf"
    "/var/lib/postgresql/16/main/pg_hba.conf"
    "$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)"
)

PG_HBA_FILE=""
for path in "${PG_HBA_PATHS[@]}"; do
    if [ -f "$path" ]; then
        PG_HBA_FILE="$path"
        break
    fi
done

if [ -n "$PG_HBA_FILE" ]; then
    echo "✅ Found pg_hba.conf at: $PG_HBA_FILE"
    # Backup
    cp "$PG_HBA_FILE" "$PG_HBA_FILE.backup"
    # Update
    sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA_FILE"
    sed -i 's/local   all             all                                     scram-sha-256/local   all             all                                     md5/' "$PG_HBA_FILE"
    echo "✅ Updated pg_hba.conf"
    systemctl restart postgresql
else
    echo "⚠️  pg_hba.conf not found, but PostgreSQL should work with default settings"
fi

# Generate new password
echo ""
echo "🔑 Generating new password..."
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Reset password
sudo -u postgres psql <<EOF
ALTER USER $DB_USER WITH PASSWORD '$NEW_PASSWORD';
EOF

# Save to file
CREDENTIALS_FILE="/root/db_credentials.txt"
cat > "$CREDENTIALS_FILE" <<CREDS
Database: $DB_NAME
User: $DB_USER
Password: $NEW_PASSWORD
DATABASE_URL: postgresql://$DB_USER:$NEW_PASSWORD@localhost:5432/$DB_NAME?schema=public
CREDS
chmod 600 "$CREDENTIALS_FILE"

echo ""
echo "✅ Configuration fixed and password set!"
echo ""
echo "📋 Database Information:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $NEW_PASSWORD"
echo ""
echo "📝 Add this to your .env file:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$NEW_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo ""
echo "📄 Credentials saved to: $CREDENTIALS_FILE"
echo ""
echo "⚠️  IMPORTANT: Save this password now!"
