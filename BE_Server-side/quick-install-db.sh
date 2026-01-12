#!/bin/bash
# Quick install script - Copy và paste vào SSH terminal

set -e

echo "🗄️  Installing PostgreSQL on server..."

# Update và cài đặt
apt update -y
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql

# Generate password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_NAME="web_technology"
DB_USER="webtech_user"

# Tạo database và user
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

# Cấu hình PostgreSQL
PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1,2)
PG_HBA_FILE="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA_FILE"
systemctl restart postgresql

# Hiển thị thông tin
echo ""
echo "✅ Database installed successfully!"
echo ""
echo "📋 Database Info:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "📝 Add to .env:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo ""
echo "⚠️  Save this password!"
