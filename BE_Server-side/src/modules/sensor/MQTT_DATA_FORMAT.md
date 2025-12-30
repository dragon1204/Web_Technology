# 📡 MQTT Sensor Data Format

## ✅ Các Format Được Hỗ Trợ

### 1. Số Đơn Giản
```
25.5
30
-10.2
```

### 2. JSON Number
```json
25.5
```

### 3. JSON Object với Field `value`
```json
{"value": 25.5}
```

### 4. JSON Object với Field `data`
```json
{"data": 25.5}
```

### 5. JSON Object với Accelerometer Data (ax, ay, az)
```json
{"ax": -0.573, "ay": -0.578, "az": 0.748}
```
**Lưu ý:** Hệ thống sẽ tự động tính **magnitude** (độ lớn vector):
```
magnitude = sqrt(ax² + ay² + az²)
```

### 6. JSON Object với Giá Trị Số Bất Kỳ
```json
{"temperature": 25.5}
{"humidity": 60}
{"pressure": 1013.25}
```
Hệ thống sẽ tự động lấy giá trị số đầu tiên tìm được.

---

## 🔄 Cách Xử Lý

1. **Parse JSON** nếu có thể
2. **Kiểm tra loại dữ liệu:**
   - Object với `ax`, `ay`, `az` → Tính magnitude
   - Object với `value` → Dùng `value`
   - Object với `data` → Dùng `data`
   - Object khác → Lấy giá trị số đầu tiên
   - Số → Dùng trực tiếp
3. **Nếu không phải JSON** → Parse như số đơn giản
4. **Nếu không hợp lệ** → Log warning và bỏ qua

---

## 📝 Ví Dụ

### Input: `{"ax":-0.573, "ay":-0.578, "az":0.748}`
**Output:** `value = sqrt(0.573² + 0.578² + 0.748²) ≈ 1.09`

### Input: `25.5`
**Output:** `value = 25.5`

### Input: `{"temperature": 30.5}`
**Output:** `value = 30.5`

---

## ⚠️ Lưu Ý

- Tất cả giá trị cuối cùng phải là **số** (Float)
- Database chỉ lưu được **một giá trị số** trong field `value`
- Nếu cần lưu nhiều giá trị, cần thay đổi schema để dùng JSON field

