#!/bin/bash
# Script to run directly on the server via SSH
# This will be executed on the remote server

set -e

echo "🗄️  Setting up PostgreSQL on server..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  This script needs sudo privileges. Running with sudo...${NC}"
    exec sudo bash "$0" "$@"
fi

# Update package list
echo "📦 Updating package list..."
apt update -y

# Install PostgreSQL
echo "📥 Installing PostgreSQL..."
apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
echo "🚀 Starting PostgreSQL service..."
systemctl start postgresql
systemctl enable postgresql

# Get PostgreSQL version
PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1,2)
echo "✅ PostgreSQL version: $(psql --version)"

# Generate random password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_NAME="web_technology"
DB_USER="webtech_user"

echo ""
echo -e "${GREEN}📝 Creating database and user...${NC}"

# Create database and user
sudo -u postgres psql <<EOF
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user with password
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

# Configure PostgreSQL to accept connections
echo "🔧 Configuring PostgreSQL..."
PG_HBA_FILE="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
PG_CONF_FILE="/etc/postgresql/$PG_VERSION/main/postgresql.conf"

# Update pg_hba.conf to allow local connections
if [ -f "$PG_HBA_FILE" ]; then
    # Backup original
    cp "$PG_HBA_FILE" "$PG_HBA_FILE.backup"
    
    # Allow local connections with password
    sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA_FILE"
fi

# Update postgresql.conf to listen on all addresses (optional, for remote access)
if [ -f "$PG_CONF_FILE" ]; then
    # Backup original
    cp "$PG_CONF_FILE" "$PG_CONF_FILE.backup"
    
    # Uncomment and set listen_addresses
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF_FILE"
fi

# Restart PostgreSQL
systemctl restart postgresql

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "📋 Database Information:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "📝 DATABASE_URL for .env file:"
echo "   postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"
echo ""
echo "⚠️  IMPORTANT: Save this password securely!"
echo ""

# Save credentials to a file (readable only by root)
CREDENTIALS_FILE="/root/db_credentials.txt"
cat > "$CREDENTIALS_FILE" <<CREDS
Database: $DB_NAME
User: $DB_USER
Password: $DB_PASSWORD
DATABASE_URL: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public
CREDS
chmod 600 "$CREDENTIALS_FILE"
echo "📄 Credentials saved to: $CREDENTIALS_FILE"
echo ""
