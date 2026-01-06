#!/bin/bash

echo "🔍 Bước 1: Kiểm tra PM2 (xem app đang chạy từ đâu)..."
pm2 list
pm2 info all | grep "script path\|cwd"

echo ""
echo "🔍 Bước 2: Tìm thư mục project..."
find /home -name "BE_Server-side" -type d 2>/dev/null
find /var/www -name "BE_Server-side" -type d 2>/dev/null
find /root -name "BE_Server-side" -type d 2>/dev/null
find /opt -name "BE_Server-side" -type d 2>/dev/null

echo ""
echo "🔍 Bước 3: Tìm file package.json..."
find /home /var/www /root /opt -name "package.json" -type f 2>/dev/null | grep -v node_modules | head -10

echo ""
echo "🔍 Bước 4: Kiểm tra các process Node.js đang chạy..."
ps aux | grep node | grep -v grep

