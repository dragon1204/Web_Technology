#!/bin/bash
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
apt update

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

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "📋 Database Information:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "📝 Add this to your .env file:"
echo "   DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo ""
echo "⚠️  IMPORTANT: Save this password securely!"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists.${NC}"
    echo "Do you want to update DATABASE_URL in .env? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        # Update or add DATABASE_URL
        if grep -q "DATABASE_URL" .env; then
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\"|" .env
        else
            echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\"" >> .env
        fi
        echo "✅ Updated .env file"
    fi
else
    echo "Creating .env file..."
    cat > .env <<ENVFILE
# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"

# JWT (Update these with your own secrets)
JWT_SECRET="change_this_jwt_secret"
JWT_REFRESH_SECRET="change_this_refresh_secret"

# Port
PORT=3000

# CORS
CORS_ORIGIN="http://localhost:3001"
ENVFILE
    chmod 600 .env
    echo "✅ Created .env file"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "   1. Review and update .env file with your secrets"
echo "   2. Run: npx prisma generate"
echo "   3. Run: npx prisma migrate deploy"
echo "   4. Run: npm run db:seed (optional)"
echo ""



