#!/bin/bash
# Script nhanh để test server - Copy và paste vào SSH terminal

echo "🔍 Quick Server Test"
echo "===================="
echo ""

# 1. Test local connection
echo "1. Testing local connection..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Server is running on localhost:3000"
    curl -s http://localhost:3000 | head -c 100
    echo ""
else
    echo "❌ Server is NOT running on localhost:3000"
fi

echo ""

# 2. Check PM2
echo "2. PM2 Status:"
if command -v pm2 &> /dev/null; then
    pm2 status
else
    echo "❌ PM2 not installed"
fi

echo ""

# 3. Check port
echo "3. Port 3000:"
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "✅ Port 3000 is listening"
    netstat -tuln | grep ":3000 "
else
    echo "❌ Port 3000 is NOT listening"
fi

echo ""

# 4. Check process
echo "4. Node.js processes:"
ps aux | grep "node.*dist" | grep -v grep || echo "   No Node.js processes found"

echo ""
echo "✅ Test complete!"
