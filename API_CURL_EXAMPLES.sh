#!/bin/bash

# API cURL Examples - Smart Garden Management System
# Base URL
BASE_URL="http://localhost:3000"

# Thay đổi token này bằng token thực tế của bạn
TOKEN="YOUR_ACCESS_TOKEN"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Smart Garden Management System - API cURL Examples ===${NC}\n"

# ============================================
# 1. AUTHENTICATION
# ============================================

echo -e "${GREEN}1. AUTHENTICATION${NC}\n"

# 1.1 Register
echo "1.1 Register:"
curl -X POST ${BASE_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }'
echo -e "\n\n"

# 1.2 Login
echo "1.2 Login:"
curl -X POST ${BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
echo -e "\n\n"

# 1.3 Refresh Token
echo "1.3 Refresh Token:"
curl -X POST ${BASE_URL}/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
echo -e "\n\n"

# 1.4 Logout
echo "1.4 Logout:"
curl -X POST ${BASE_URL}/auth/logout \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 1.5 Generate 2FA
echo "1.5 Generate 2FA Secret:"
curl -X POST ${BASE_URL}/auth/2fa/generate \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 1.6 Enable 2FA
echo "1.6 Enable 2FA:"
curl -X POST ${BASE_URL}/auth/2fa/enable \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
echo -e "\n\n"

# ============================================
# 2. USERS
# ============================================

echo -e "${GREEN}2. USERS${NC}\n"

# 2.1 Get all users (Admin)
echo "2.1 Get all users:"
curl -X GET ${BASE_URL}/users \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 2.2 Get my profile
echo "2.2 Get my profile:"
curl -X GET ${BASE_URL}/users/me \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 2.3 Get user by ID
echo "2.3 Get user by ID:"
curl -X GET ${BASE_URL}/users/1 \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 2.4 Create user (Admin)
echo "2.4 Create user:"
curl -X POST ${BASE_URL}/users \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "role": "USER"
  }'
echo -e "\n\n"

# 2.5 Update user (Admin)
echo "2.5 Update user:"
curl -X PUT ${BASE_URL}/users/1 \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "role": "ADMIN"
  }'
echo -e "\n\n"

# 2.6 Delete user (Admin)
echo "2.6 Delete user:"
curl -X DELETE ${BASE_URL}/users/1 \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# ============================================
# 3. GARDENS
# ============================================

echo -e "${GREEN}3. GARDENS${NC}\n"

# 3.1 Create garden
echo "3.1 Create garden:"
curl -X POST ${BASE_URL}/garden \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vườn A",
    "area": 100.5,
    "location": "Hà Nội",
    "description": "Vườn trồng rau cải"
  }'
echo -e "\n\n"

# 3.2 Get all gardens
echo "3.2 Get all gardens:"
curl -X GET "${BASE_URL}/garden?page=1&limit=10" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 3.3 Get garden by ID
echo "3.3 Get garden by ID:"
curl -X GET ${BASE_URL}/garden/1 \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 3.4 Update garden
echo "3.4 Update garden:"
curl -X PUT ${BASE_URL}/garden/1 \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vườn A Updated",
    "area": 120.0,
    "location": "Hà Nội",
    "description": "Mô tả mới"
  }'
echo -e "\n\n"

# 3.5 Delete garden (Admin)
echo "3.5 Delete garden:"
curl -X DELETE ${BASE_URL}/garden/1 \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# ============================================
# 4. SALES
# ============================================

echo -e "${GREEN}4. SALES${NC}\n"

# 4.1 Create sale
echo "4.1 Create sale:"
curl -X POST ${BASE_URL}/garden/1/sale \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vegetableId": 1,
    "quantity": 10,
    "priceAtSale": 30000
  }'
echo -e "\n\n"

# 4.2 Get sales by garden
echo "4.2 Get sales by garden:"
curl -X GET ${BASE_URL}/garden/1/sale \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 4.3 Get garden revenue
echo "4.3 Get garden revenue:"
curl -X GET ${BASE_URL}/garden/1/sale/revenue \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# ============================================
# 5. VEGETABLES
# ============================================

echo -e "${GREEN}5. VEGETABLES${NC}\n"

# 5.1 Create vegetable
echo "5.1 Create vegetable:"
curl -X POST ${BASE_URL}/vegetable \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rau cải",
    "imported": 100,
    "sold": 0,
    "price": 30000,
    "category": "leafy",
    "description": "Rau cải xanh"
  }'
echo -e "\n\n"

# 5.2 Get all vegetables
echo "5.2 Get all vegetables:"
curl -X GET "${BASE_URL}/vegetable?page=1&limit=10&search=rau" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 5.3 Update price
echo "5.3 Update price:"
curl -X PATCH ${BASE_URL}/vegetable/price/1 \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 35000
  }'
echo -e "\n\n"

# 5.4 Update imported
echo "5.4 Update imported:"
curl -X PATCH ${BASE_URL}/vegetable/imported/1 \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "imported": 150
  }'
echo -e "\n\n"

# 5.5 Update sold
echo "5.5 Update sold:"
curl -X PATCH ${BASE_URL}/vegetable/sold/1 \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sold": 50
  }'
echo -e "\n\n"

# 5.6 Get revenue list
echo "5.6 Get revenue list:"
curl -X GET "${BASE_URL}/vegetable/revenue/list?type=month&gardenId=1" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 5.7 Get total revenue
echo "5.7 Get total revenue:"
curl -X GET "${BASE_URL}/vegetable/revenue/total?type=day" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 5.8 Get price history
echo "5.8 Get price history:"
curl -X GET "${BASE_URL}/vegetable/price-history/1?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# ============================================
# 6. SENSORS
# ============================================

echo -e "${GREEN}6. SENSORS${NC}\n"

# 6.1 Get sensor data
echo "6.1 Get sensor data:"
curl -X GET "${BASE_URL}/sensor-data/sensor/1?startDate=2024-12-01&endDate=2024-12-31&limit=100" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 6.2 Get sensor statistics
echo "6.2 Get sensor statistics:"
curl -X GET "${BASE_URL}/sensor-data/sensor/1/statistics?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# ============================================
# 7. NOTIFICATIONS
# ============================================

echo -e "${GREEN}7. NOTIFICATIONS${NC}\n"

# 7.1 Create notification (Admin)
echo "7.1 Create notification:"
curl -X POST ${BASE_URL}/notifications \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Thông báo mới",
    "message": "Nội dung thông báo",
    "type": "info"
  }'
echo -e "\n\n"

# 7.2 Get notifications
echo "7.2 Get notifications:"
curl -X GET "${BASE_URL}/notifications?isRead=false" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 7.3 Get unread count
echo "7.3 Get unread count:"
curl -X GET ${BASE_URL}/notifications/unread/count \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 7.4 Mark as read
echo "7.4 Mark as read:"
curl -X PATCH ${BASE_URL}/notifications/1/read \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 7.5 Mark all as read
echo "7.5 Mark all as read:"
curl -X PATCH ${BASE_URL}/notifications/read-all \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 7.6 Delete notification
echo "7.6 Delete notification:"
curl -X DELETE ${BASE_URL}/notifications/1 \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# ============================================
# 8. ALERTS
# ============================================

echo -e "${GREEN}8. ALERTS${NC}\n"

# 8.1 Get alerts
echo "8.1 Get alerts:"
curl -X GET "${BASE_URL}/alerts?gardenId=1&isResolved=false" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 8.2 Get active alerts count
echo "8.2 Get active alerts count:"
curl -X GET "${BASE_URL}/alerts/active/count?gardenId=1" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 8.3 Resolve alert
echo "8.3 Resolve alert:"
curl -X PATCH ${BASE_URL}/alerts/1/resolve \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 8.4 Create alert rule
echo "8.4 Create alert rule:"
curl -X POST ${BASE_URL}/alerts/rules \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "gardenId": 1,
    "sensorId": 1,
    "minValue": 15,
    "maxValue": 35,
    "alertOnMin": true,
    "alertOnMax": true,
    "severity": "warning"
  }'
echo -e "\n\n"

# 8.5 Get alert rules
echo "8.5 Get alert rules:"
curl -X GET "${BASE_URL}/alerts/rules?gardenId=1" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 8.6 Get alert rule by ID
echo "8.6 Get alert rule by ID:"
curl -X GET ${BASE_URL}/alerts/rules/1 \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 8.7 Update alert rule
echo "8.7 Update alert rule:"
curl -X PATCH ${BASE_URL}/alerts/rules/1 \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "minValue": 20,
    "maxValue": 40,
    "isActive": true
  }'
echo -e "\n\n"

# 8.8 Delete alert rule
echo "8.8 Delete alert rule:"
curl -X DELETE ${BASE_URL}/alerts/rules/1 \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# ============================================
# 9. ANALYTICS & REPORTS
# ============================================

echo -e "${GREEN}9. ANALYTICS & REPORTS${NC}\n"

# 9.1 Revenue by period
echo "9.1 Revenue by period:"
curl -X GET "${BASE_URL}/analytics/revenue/period?period=month&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.2 Compare revenue between gardens
echo "9.2 Compare revenue between gardens:"
curl -X GET "${BASE_URL}/analytics/revenue/compare-gardens?startDate=2024-01-01&endDate=2024-12-31&gardenIds=1,2,3" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.3 Top selling products
echo "9.3 Top selling products:"
curl -X GET "${BASE_URL}/analytics/revenue/top-products?limit=10&gardenId=1" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.4 Productivity by category
echo "9.4 Productivity by category:"
curl -X GET "${BASE_URL}/analytics/productivity/by-category?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.5 Sales to inventory ratio
echo "9.5 Sales to inventory ratio:"
curl -X GET "${BASE_URL}/analytics/productivity/sales-inventory-ratio?gardenId=1" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.6 Production trend
echo "9.6 Production trend:"
curl -X GET "${BASE_URL}/analytics/productivity/trend?period=month&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.7 Sensor analysis
echo "9.7 Sensor analysis:"
curl -X GET "${BASE_URL}/analytics/sensor/analysis?sensorId=1&period=day&startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.8 Optimal conditions
echo "9.8 Optimal conditions:"
curl -X GET "${BASE_URL}/analytics/sensor/optimal-conditions?gardenId=1" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.9 Custom report
echo "9.9 Custom report:"
curl -X POST ${BASE_URL}/analytics/custom \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "revenue",
    "period": "month",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "filters": {
      "gardenId": 1,
      "vegetableId": 1
    }
  }'
echo -e "\n\n"

# 9.10 Create report template
echo "9.10 Create report template:"
curl -X POST ${BASE_URL}/analytics/templates \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Revenue Report",
    "description": "Báo cáo doanh thu hàng tháng",
    "type": "revenue",
    "config": {
      "period": "month",
      "filters": {
        "gardenId": 1
      }
    },
    "isPublic": false
  }'
echo -e "\n\n"

# 9.11 Get report templates
echo "9.11 Get report templates:"
curl -X GET ${BASE_URL}/analytics/templates \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.12 Get report template by ID
echo "9.12 Get report template by ID:"
curl -X GET ${BASE_URL}/analytics/templates/1 \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 9.13 Update report template
echo "9.13 Update report template:"
curl -X PATCH ${BASE_URL}/analytics/templates/1 \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Report Name",
    "isPublic": true
  }'
echo -e "\n\n"

# 9.14 Delete report template
echo "9.14 Delete report template:"
curl -X DELETE ${BASE_URL}/analytics/templates/1 \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# ============================================
# 10. AUDIT LOGS
# ============================================

echo -e "${GREEN}10. AUDIT LOGS${NC}\n"

# 10.1 Get recent audit logs (Admin)
echo "10.1 Get recent audit logs:"
curl -X GET "${BASE_URL}/audit/recent?limit=100" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 10.2 Get my audit logs
echo "10.2 Get my audit logs:"
curl -X GET "${BASE_URL}/audit/my-logs?limit=50" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 10.3 Get audit logs by entity (Admin)
echo "10.3 Get audit logs by entity:"
curl -X GET "${BASE_URL}/audit/by-entity?entityType=Garden&entityId=1&limit=50" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

# 10.4 Get audit logs by request ID (Admin)
echo "10.4 Get audit logs by request ID:"
curl -X GET "${BASE_URL}/audit/by-request?requestId=abc123" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\n\n"

echo -e "${BLUE}=== End of API Examples ===${NC}"






