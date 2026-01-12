# 🧪 Cách Test Server

## 📋 Các Cách Test Server

### 1. Test Từ Local (Windows PowerShell)

```powershell
# Test kết nối cơ bản
Invoke-WebRequest -Uri "http://159.223.61.25:3000" -Method Get -TimeoutSec 5

# Test port
Test-NetConnection -ComputerName 159.223.61.25 -Port 3000

# Test API endpoint
Invoke-WebRequest -Uri "http://159.223.61.25:3000/api" -Method Get
```

### 2. Test Từ Browser

Mở browser và truy cập:
- **Server:** http://159.223.61.25:3000
- **Swagger API Docs:** http://159.223.61.25:3000/api

### 3. Test Trên Server (SSH)

SSH vào server và chạy:

```bash
# Kiểm tra PM2 status
pm2 status

# Kiểm tra logs
pm2 logs be-server

# Test local connection
curl http://localhost:3000

# Kiểm tra port
netstat -tuln | grep 3000

# Kiểm tra process
ps aux | grep node
```

### 4. Dùng Script Tự Động

**Từ Local (PowerShell):**
```powershell
.\test-server.ps1
```

**Trên Server (SSH):**
```bash
bash check-server-status.sh
```

## ✅ Các Endpoint Để Test

1. **Root:** `GET http://159.223.61.25:3000`
2. **Swagger:** `GET http://159.223.61.25:3000/api`
3. **API Base:** `GET http://159.223.61.25:3000/api`

## 🔍 Kiểm Tra Chi Tiết

### Kiểm Tra PM2 Trên Server

```bash
ssh root@159.223.61.25
cd /var/web/Web_Technology/BE_Server-side
pm2 status
pm2 logs be-server --lines 50
```

### Kiểm Tra Database Connection

```bash
# Trên server
cd /var/web/Web_Technology/BE_Server-side
npm run db:test
```

### Kiểm Tra Port và Firewall

```bash
# Kiểm tra port đang listen
netstat -tuln | grep 3000

# Kiểm tra firewall
ufw status
```

## 🚨 Troubleshooting

### Server Không Phản Hồi

1. **Kiểm tra PM2:**
   ```bash
   pm2 status
   pm2 restart be-server
   ```

2. **Kiểm tra logs:**
   ```bash
   pm2 logs be-server --err
   ```

3. **Kiểm tra port:**
   ```bash
   lsof -i :3000
   ```

4. **Restart server:**
   ```bash
   cd /var/web/Web_Technology/BE_Server-side
   pm2 restart be-server
   ```

### Lỗi Kết Nối Database

```bash
# Test database connection
cd /var/web/Web_Technology/BE_Server-side
npm run db:test
```

### Firewall Block

```bash
# Mở port 3000
ufw allow 3000/tcp
ufw reload
```
