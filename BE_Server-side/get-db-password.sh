#!/bin/bash
# Script để lấy lại password database

echo "🔍 Retrieving database password..."

# Thử các cách để lấy password
DB_NAME="web_technology"
DB_USER="webtech_user"

# Cách 1: Kiểm tra file credentials nếu có
if [ -f "/root/db_credentials.txt" ]; then
    echo "✅ Found credentials file:"
    cat /root/db_credentials.txt
    exit 0
fi

# Cách 2: Kiểm tra .env file
if [ -f "/var/web/Web_Technology/BE_Server-side/.env" ]; then
    echo "✅ Found .env file:"
    grep DATABASE_URL /var/web/Web_Technology/BE_Server-side/.env | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/Password: \1/'
fi

# Cách 3: Reset password mới
echo ""
echo "⚠️  Password not found. Generating new password..."
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

sudo -u postgres psql <<EOF
ALTER USER $DB_USER WITH PASSWORD '$NEW_PASSWORD';
EOF

echo ""
echo "✅ New password set!"
echo ""
echo "📋 Database Information:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $NEW_PASSWORD"
echo ""
echo "📝 DATABASE_URL:"
echo "postgresql://$DB_USER:$NEW_PASSWORD@localhost:5432/$DB_NAME?schema=public"
echo ""
echo "⚠️  Save this password now!"
