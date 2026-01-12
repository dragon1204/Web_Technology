#!/bin/bash
# Script để test server - Copy và paste vào SSH terminal hoặc chạy từ local

SERVER_IP="159.223.61.25"
SERVER_PORT="3000"
BASE_URL="http://${SERVER_IP}:${SERVER_PORT}"

echo "🔍 Testing server at ${BASE_URL}..."
echo ""

# Test 1: Kiểm tra server có đang chạy không
echo "1. Testing server connection..."
if curl -s --connect-timeout 5 "${BASE_URL}" > /dev/null 2>&1; then
    echo "✅ Server is responding"
else
    echo "❌ Server is not responding"
    echo ""
    echo "📝 Checking PM2 status on server..."
    echo "   SSH vào server và chạy: pm2 status"
    exit 1
fi

# Test 2: Kiểm tra health endpoint (nếu có)
echo ""
echo "2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/health" 2>/dev/null)
if [ $? -eq 0 ] && [ ! -z "$HEALTH_RESPONSE" ]; then
    echo "✅ Health endpoint: ${HEALTH_RESPONSE}"
else
    echo "⚠️  Health endpoint not found or not responding"
fi

# Test 3: Kiểm tra API endpoint
echo ""
echo "3. Testing API endpoint..."
API_RESPONSE=$(curl -s "${BASE_URL}/api" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ API endpoint is accessible"
    echo "   Response: ${API_RESPONSE:0:100}..."
else
    echo "⚠️  API endpoint not accessible"
fi

# Test 4: Test database connection (nếu có endpoint)
echo ""
echo "4. Testing database connection..."
DB_TEST=$(curl -s "${BASE_URL}/api/health/db" 2>/dev/null)
if [ $? -eq 0 ] && [ ! -z "$DB_TEST" ]; then
    echo "✅ Database connection: OK"
else
    echo "⚠️  Database health endpoint not found"
fi

echo ""
echo "✅ Server test complete!"
echo ""
echo "📝 To check server status on server:"
echo "   ssh root@${SERVER_IP}"
echo "   pm2 status"
echo "   pm2 logs be-server"
