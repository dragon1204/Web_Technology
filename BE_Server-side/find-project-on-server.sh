#!/bin/bash

# Script để tìm project trên server

echo "🔍 Đang tìm thư mục BE_Server-side..."
echo ""

# Tìm trong các thư mục phổ biến
echo "1. Tìm trong /home:"
find /home -name "BE_Server-side" -type d 2>/dev/null

echo ""
echo "2. Tìm trong /var/www:"
find /var/www -name "BE_Server-side" -type d 2>/dev/null

echo ""
echo "3. Tìm trong /root:"
find /root -name "BE_Server-side" -type d 2>/dev/null

echo ""
echo "4. Tìm trong /opt:"
find /opt -name "BE_Server-side" -type d 2>/dev/null

echo ""
echo "5. Tìm file package.json (có thể là project Node.js):"
find /home /var/www /root /opt -name "package.json" -type f 2>/dev/null | head -10

echo ""
echo "6. Kiểm tra thư mục hiện tại:"
pwd
ls -la

echo ""
echo "7. Kiểm tra xem có git repo nào không:"
find /home /var/www /root /opt -name ".git" -type d 2>/dev/null | head -10

