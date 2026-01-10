#!/bin/bash
# Script để upload .env lên server

SSH_HOST="159.223.61.25"
SSH_USER="root"
REMOTE_PATH="/var/web/Web_Technology/BE_Server-side"

echo "📤 Uploading .env file to server..."

# Upload file
scp .env ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/.env

if [ $? -eq 0 ]; then
    # Set permissions
    ssh ${SSH_USER}@${SSH_HOST} "chmod 600 ${REMOTE_PATH}/.env"
    
    echo ""
    echo "✅ .env file uploaded successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. SSH: ssh root@159.223.61.25"
    echo "   2. Run: cd $REMOTE_PATH && npx prisma generate"
    echo "   3. Run: npx prisma migrate deploy"
else
    echo "❌ Upload failed!"
    echo ""
    echo "💡 Alternative: Copy and paste this into SSH terminal:"
    echo ""
    cat create-env-on-server.sh
fi
