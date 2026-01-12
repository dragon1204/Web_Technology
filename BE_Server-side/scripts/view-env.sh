#!/bin/bash
# Script để xem file .env trên server

ENV_FILE="/var/web/Web_Technology/BE_Server-side/.env"

echo "📋 Nội dung file .env:"
echo "=========================================="
if [ -f "$ENV_FILE" ]; then
    cat "$ENV_FILE"
else
    echo "❌ File .env không tồn tại tại: $ENV_FILE"
fi
echo "=========================================="
