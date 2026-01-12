# Hướng dẫn cài đặt MinIO trên Localhost (Windows)

## Option 1: Sử dụng Docker (Khuyến nghị - Dễ nhất)

### 1. Cài đặt Docker Desktop
- Tải từ: https://www.docker.com/products/docker-desktop
- Cài đặt và khởi động Docker Desktop

### 2. Chạy MinIO container
```powershell
docker run -d `
  --name minio `
  -p 9000:9000 `
  -p 9001:9001 `
  -e "MINIO_ROOT_USER=minioadmin" `
  -e "MINIO_ROOT_PASSWORD=minioadmin" `
  -v minio-data:/data `
  minio/minio server /data --console-address ":9001"
```

### 3. Truy cập MinIO Console
- Mở trình duyệt: `http://localhost:9001`
- Username: `minioadmin`
- Password: `minioadmin`

### 4. Tạo bucket
1. Đăng nhập vào MinIO Console
2. Click "Create Bucket"
3. Tên bucket: `files`
4. Click "Create Bucket"

---

## Option 2: Cài đặt trực tiếp (Windows)

### 1. Tải MinIO
```powershell
# Tải MinIO từ PowerShell
Invoke-WebRequest -Uri "https://dl.min.io/server/minio/release/windows-amd64/minio.exe" -OutFile "minio.exe"
```

Hoặc tải thủ công từ: https://dl.min.io/server/minio/release/windows-amd64/minio.exe

### 2. Tạo thư mục lưu trữ
```powershell
mkdir C:\minio-data
```

### 3. Chạy MinIO
```powershell
# Mở PowerShell tại thư mục chứa minio.exe
.\minio.exe server C:\minio-data --console-address ":9001"
```

Hoặc tạo file `start-minio.bat`:
```batch
@echo off
echo Starting MinIO...
minio.exe server C:\minio-data --console-address ":9001"
pause
```

### 4. Truy cập
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- Username: `minioadmin`
- Password: `minioadmin`

---

## Option 3: Sử dụng Chocolatey (Nếu đã cài Chocolatey)

```powershell
choco install minio
minio server C:\minio-data --console-address ":9001"
```

---

## Cấu hình .env cho Local Development

Tạo hoặc cập nhật file `.env` trong project:

```env
# MinIO Configuration (Local)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=files
```

---

## Cài đặt Packages cho Project

```powershell
npm install minio @types/multer multer
```

---

## Test MinIO

### 1. Kiểm tra MinIO đang chạy
Mở trình duyệt: `http://localhost:9001`

### 2. Test với MinIO Client (mc)

**Windows:**
```powershell
# Tải mc
Invoke-WebRequest -Uri "https://dl.min.io/client/mc/release/windows-amd64/mc.exe" -OutFile "mc.exe"

# Cấu hình alias
.\mc.exe alias set local http://localhost:9000 minioadmin minioadmin

# Tạo bucket
.\mc.exe mb local/files

# List buckets
.\mc.exe ls local
```

---

## Khởi động lại ứng dụng

```powershell
npm run start:dev
```

---

## Troubleshooting

### Port đã được sử dụng
```powershell
# Kiểm tra port
netstat -ano | findstr :9000
netstat -ano | findstr :9001

# Kill process nếu cần
taskkill /PID <PID> /F
```

### Docker container không chạy
```powershell
# Xem containers
docker ps -a

# Start container
docker start minio

# Xem logs
docker logs minio
```

### Không kết nối được
- Kiểm tra firewall Windows
- Đảm bảo MinIO đang chạy
- Test: `curl http://localhost:9000/minio/health/live`

---

## Quick Start Script (PowerShell)

Tạo file `setup-minio-local.ps1`:

```powershell
# Check if Docker is running
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "🐳 Using Docker..." -ForegroundColor Green
    
    # Stop existing container if exists
    docker stop minio 2>$null
    docker rm minio 2>$null
    
    # Run MinIO
    docker run -d `
      --name minio `
      -p 9000:9000 `
      -p 9001:9001 `
      -e "MINIO_ROOT_USER=minioadmin" `
      -e "MINIO_ROOT_PASSWORD=minioadmin" `
      -v minio-data:/data `
      minio/minio server /data --console-address ":9001"
    
    Write-Host "✅ MinIO started!" -ForegroundColor Green
    Write-Host "🌐 Console: http://localhost:9001" -ForegroundColor Cyan
    Write-Host "🔑 Username: minioadmin" -ForegroundColor Cyan
    Write-Host "🔑 Password: minioadmin" -ForegroundColor Cyan
} else {
    Write-Host "❌ Docker not found. Please install Docker Desktop." -ForegroundColor Red
}
```

Chạy:
```powershell
.\setup-minio-local.ps1
```
