#!/bin/bash
# Script để kiểm tra server status trên server - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🔍 Checking server status..."
echo ""

# 1. Kiểm tra PM2
echo "1. PM2 Status:"
if command -v pm2 &> /dev/null; then
    pm2 status
    echo ""
    echo "📊 PM2 Info:"
    pm2 info be-server 2>/dev/null || echo "   App 'be-server' not found"
else
    echo "❌ PM2 not installed"
fi

echo ""

# 2. Kiểm tra port 3000
echo "2. Port 3000 Status:"
if netstat -tuln | grep -q ":3000 "; then
    echo "✅ Port 3000 is listening"
    netstat -tuln | grep ":3000 "
else
    echo "❌ Port 3000 is not listening"
fi

echo ""

# 3. Kiểm tra process Node.js
echo "3. Node.js Processes:"
ps aux | grep node | grep -v grep || echo "   No Node.js processes running"

echo ""

# 4. Kiểm tra application logs
echo "4. Recent Application Logs:"
if command -v pm2 &> /dev/null; then
    echo "   Last 10 lines from PM2:"
    pm2 logs be-server --lines 10 --nostream 2>/dev/null || echo "   No logs available"
else
    echo "   PM2 not available"
fi

echo ""

# 5. Test local connection
echo "5. Testing local connection:"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Server is responding on localhost:3000"
    curl -s http://localhost:3000 | head -c 100
    echo ""
else
    echo "❌ Server is not responding on localhost:3000"
fi

echo ""
echo "✅ Status check complete!"
