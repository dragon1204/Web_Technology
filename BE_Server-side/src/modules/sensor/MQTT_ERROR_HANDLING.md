# 🔧 MQTT Error Handling

## ✅ Xử Lý Lỗi Sensor Không Tồn Tại

### Vấn Đề
Khi MQTT nhận được message với sensor ID không tồn tại trong database, hệ thống sẽ:

### Giải Pháp
1. **Log Warning** thay vì throw error
   ```
   Sensor with ID {sensorId} not found. Skipping data save.
   ```

2. **Bỏ qua message** - Không lưu vào database
3. **Không broadcast** qua WebSocket
4. **Tiếp tục xử lý** các message khác

---

## 📝 Flow Xử Lý

```
MQTT Message → Parse Value → Check Sensor Exists?
                                    ↓
                              Yes → Save to DB → Broadcast WebSocket
                                    ↓
                              No  → Log Warning → Skip
```

---

## ⚠️ Lưu Ý

- **Sensor phải được tạo trước** trong database trước khi nhận dữ liệu
- **Topic format:** `sensor/{sensorId}/{type}` (ví dụ: `sensor/1/temperature`)
- **Sensor ID** phải là số hợp lệ và tồn tại trong bảng `Sensor`

---

## 🔍 Debug

Nếu thấy warning "Sensor with ID X not found":
1. Kiểm tra sensor có tồn tại trong database
2. Kiểm tra topic format có đúng không
3. Chạy seed script để tạo sensor mẫu (nếu cần)

---

## 📊 Ví Dụ

### ✅ Đúng
```
Topic: sensor/1/temperature
Payload: 25.5
→ Sensor ID 1 tồn tại → Lưu thành công → Broadcast
```

### ❌ Sai
```
Topic: sensor/999/temperature
Payload: 25.5
→ Sensor ID 999 không tồn tại → Log warning → Bỏ qua
```


