#!/bin/bash

# SSH vào server
# IP: 159.223.61.25
# User: root
# Password: 8dee5a15756d8f73d03b73fb83

echo "Đang kết nối đến server..."
echo "IP: 159.223.61.25"
echo "User: root"
echo ""

# SSH với password (sẽ hỏi password khi kết nối)
ssh root@159.223.61.25

# Nếu muốn tự động nhập password, cần dùng sshpass:
# sshpass -p '8dee5a15756d8f73d03b73fb83' ssh root@159.223.61.25

