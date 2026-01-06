# Hướng Dẫn Fix Lỗi Trên Server

## Các Lỗi Cần Fix

### 1. **prisma/seed.ts - Lỗi `area` không tồn tại**
**Đã fix:** File `seed.ts` đã được sửa, không còn `area`, `location`, `description` trong Garden create.

### 2. **alert-rule.service.ts - Lỗi `sensor` trong include**
**Đã fix:** Đã xóa `sensor` khỏi include, chỉ còn `garden: true`.

### 3. **alert.service.ts - Lỗi `sensor` trong include**
**Đã fix:** Đã xóa `sensor` khỏi include, chỉ còn `rule` và `garden`.

### 4. **analytics.service.ts - Lỗi `prisma.sensor`**
**Đã fix:** Đã thay `prisma.sensor.findMany` bằng `prisma.sensorData.findMany` với `deviceMac`.

### 5. **sensor/mqtt/mqtt.service.ts - File không tồn tại**
**Đã fix:** File này đã được xóa, không còn tồn tại trong codebase.

## Các Bước Fix Trên Server

### Bước 1: Xóa folder sensor nếu còn tồn tại
```bash
rm -rf src/modules/sensor
```

### Bước 2: Xóa dist và cache
```bash
rm -rf dist
rm -rf node_modules/.cache
```

### Bước 3: Generate Prisma Client lại
```bash
npx prisma generate
```

### Bước 4: Rebuild
```bash
npm run build
```

### Bước 5: Restart server
```bash
npm run start:dev
```

## Kiểm Tra Các File Đã Được Fix

### ✅ prisma/seed.ts
- Không còn `area`, `location`, `description` trong Garden create
- Chỉ có `name` và `ownerId`

### ✅ src/modules/alert/alert-rule.service.ts
- Không còn `sensor` trong include
- Chỉ có `garden: true`

### ✅ src/modules/alert/alert.service.ts
- Không còn `sensor` trong include
- Chỉ có `rule` và `garden`

### ✅ src/modules/analytics/analytics.service.ts
- Không còn `prisma.sensor.findMany`
- Đã thay bằng `prisma.sensorData.findMany` với `deviceMac`

### ✅ src/modules/sensor/
- Folder này đã được xóa hoàn toàn

## Nếu Vẫn Còn Lỗi

1. **Kiểm tra git status:**
   ```bash
   git status
   ```

2. **Đảm bảo đã commit và push tất cả thay đổi:**
   ```bash
   git add .
   git commit -m "Remove sensor module and fix all references"
   git push
   ```

3. **Trên server, pull code mới nhất:**
   ```bash
   git pull origin main  # hoặc branch của bạn
   ```

4. **Xóa node_modules và reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   ```

5. **Generate Prisma và rebuild:**
   ```bash
   npx prisma generate
   npm run build
   ```

## Lưu Ý

- Lỗi về `src/modules/sensor/sensor-data.service.ts` trong linter là do cache TypeScript language server
- Restart TypeScript server trong IDE sẽ fix lỗi này
- Build thành công nghĩa là code đã đúng, chỉ cần fix trên server

