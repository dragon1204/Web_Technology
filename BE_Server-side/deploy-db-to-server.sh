#!/bin/bash
set -e

# SSH Configuration
SSH_HOST="159.223.61.25"
SSH_USER="root"
SSH_PASSWORD="manhNPC7524web"
REMOTE_PATH="/var/web/Web_Technology/BE_Server-side"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying database setup to server...${NC}"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}⚠️  sshpass not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v brew &> /dev/null; then
            echo -e "${RED}❌ Please install Homebrew first: https://brew.sh${NC}"
            exit 1
        fi
        brew install hudochenkov/sshpass/sshpass
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y sshpass
    else
        echo -e "${RED}❌ Please install sshpass manually${NC}"
        exit 1
    fi
fi

# Upload setup-db.sh to server
echo -e "${GREEN}📤 Uploading setup script to server...${NC}"
sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no setup-db.sh "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"

# Create remote directory if it doesn't exist
echo -e "${GREEN}📁 Ensuring remote directory exists...${NC}"
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "mkdir -p $REMOTE_PATH"

# Make script executable and run it
echo -e "${GREEN}🔧 Running database setup on server...${NC}"
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'ENDSSH'
cd /var/web/Web_Technology/BE_Server-side
chmod +x setup-db.sh
./setup-db.sh
ENDSSH

echo ""
echo -e "${GREEN}✅ Database setup completed on server!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "   1. SSH into server: ssh root@159.223.61.25"
echo "   2. Check .env file in $REMOTE_PATH"
echo "   3. Run migrations: cd $REMOTE_PATH && npx prisma migrate deploy"
echo "   4. (Optional) Run seed: npm run db:seed"
echo ""
