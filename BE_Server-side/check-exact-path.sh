#!/bin/bash

echo "🔍 Kiểm tra đường dẫn chính xác từ PM2..."
pm2 describe be-server | grep -E "cwd|script path|exec cwd"

echo ""
echo "🔍 Kiểm tra thư mục /var/web..."
ls -la /var/web/ 2>/dev/null || echo "Thư mục /var/web không tồn tại"

echo ""
echo "🔍 Tìm tất cả thư mục Web_Technology..."
find /var -name "Web_Technology" -type d 2>/dev/null

echo ""
echo "🔍 Tìm thư mục BE_Server-side..."
find /var -name "BE_Server-side" -type d 2>/dev/null

echo ""
echo "🔍 Kiểm tra process đang chạy..."
ps aux | grep "BE_Server-side" | grep -v grep

