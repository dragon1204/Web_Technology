# Garden Module - WebSocket Device Control UX/UI Guide

## Tổng quan

Tài liệu này mô tả chi tiết về UX/UI của module Garden và các luồng điều khiển thiết bị bằng WebSocket trong hệ thống Smart Garden Management.

---

## 1. Cấu trúc Components

### 1.1 GardenList Component
**File:** `src/components/Gardens/GardenList.jsx`

**Chức năng:**
- Hiển thị danh sách tất cả gardens
- Tạo mới và chỉnh sửa garden
- Xóa garden
- Điều hướng đến dashboard của garden khi click
- Thêm thiết bị cho garden chưa có deviceMac

**UI Elements:**
- Table hiển thị: Name, Location, Area, Device MAC, Description
- Chip hiển thị trạng thái deviceMac (có/chưa có)
- IconButton để điều hướng đến dashboard hoặc thêm thiết bị
- Dialog để tạo/sửa garden

**Luồng:**
1. User click "ADD GARDEN" → Mở dialog tạo mới
2. User điền thông tin → Click "Create" → Tạo garden mới
3. User click icon Settings trên garden có deviceMac → Điều hướng đến `/gardens/:id`
4. User click icon Add trên garden chưa có deviceMac → Mở PairDeviceModal

---

### 1.2 GardenDashboard Component
**File:** `src/components/Gardens/GardenDashboard.jsx`

**Chức năng:**
- Hiển thị dashboard của một garden cụ thể
- Hiển thị dữ liệu sensor realtime (nhiệt độ, độ ẩm không khí, độ ẩm đất)
- Điều khiển bơm nước (ON/OFF/AUTO)
- Thêm thiết bị nếu garden chưa có

**UI Layout:**
```
┌─────────────────────────────────────────┐
│ [←] Garden Name          [Status] [Add] │
│      Location • Area                     │
├─────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │ Temp │ │Humid │ │ Soil │             │
│ │ 25°C │ │ 60%  │ │ 45%  │             │
│ └──────┘ └──────┘ └──────┘             │
├─────────────────────────────────────────┤
│ 💧 Pump Control                         │
│ [BẬT] [TẮT] [TỰ ĐỘNG]                  │
└─────────────────────────────────────────┘
```

**Luồng WebSocket:**
1. Component mount → Fetch garden data từ API
2. Nếu garden có `deviceMac` → Tự động join WebSocket room (`iot/garden/join`)
3. Nhận `initialData` từ server → Hiển thị dữ liệu ban đầu
4. Lắng nghe event `iot/sensor` → Cập nhật dữ liệu realtime
5. User click điều khiển bơm → Gửi `iot/device/pump` → Cập nhật UI

**States:**
- `loading`: Đang tải thông tin garden
- `connected`: WebSocket đã kết nối
- `sensorData`: Dữ liệu sensor realtime
- `pumpStatus`: Trạng thái bơm hiện tại

---

### 1.3 PairDeviceModal Component
**File:** `src/components/Gardens/PairDeviceModal.jsx`

**Chức năng:**
- Modal để pair thiết bị ESP32 với garden
- Đếm ngược 4 phút (240 giây)
- Hiển thị progress bar và thời gian còn lại
- Xử lý kết quả pairing (success/timeout/error)

**UI States:**

**State 1: Chưa bắt đầu**
```
┌─────────────────────────────┐
│ Tìm kiếm thiết bị           │
├─────────────────────────────┤
│ Bấm "Bắt đầu tìm kiếm" để   │
│ bắt đầu quá trình ghép...   │
│                             │
│ [Hướng dẫn]                 │
│ 1. Nhấn nút "Bắt đầu..."    │
│ 2. Nhấn nút trên ESP32      │
│ 3. Đợi tối đa 4 phút        │
├─────────────────────────────┤
│ [Hủy] [Bắt đầu tìm kiếm]    │
└─────────────────────────────┘
```

**State 2: Đang pairing**
```
┌─────────────────────────────┐
│ Tìm kiếm thiết bị           │
├─────────────────────────────┤
│ Đang tìm kiếm thiết bị...   │
│                             │
│       03:45                  │
│ [████████░░░░░░░░░░] 75%    │
│                             │
│ ⚠️ Vui lòng nhấn nút trên   │
│    ESP32...                  │
│    Thời gian còn lại: 03:45 │
├─────────────────────────────┤
│ [Hủy] [Đang tìm kiếm...]    │
└─────────────────────────────┘
```

**State 3: Thành công**
```
┌─────────────────────────────┐
│ Tìm kiếm thiết bị           │
├─────────────────────────────┤
│ ✅ Đã thêm thiết bị thành   │
│    công!                     │
│                             │
│ Device MAC: AA:BB:CC:DD:EE  │
│                             │
│ Nhấn "Lưu" để hoàn tất...   │
├─────────────────────────────┤
│ [Hủy] [Lưu]                 │
└─────────────────────────────┘
```

**State 4: Timeout/Error**
```
┌─────────────────────────────┐
│ Tìm kiếm thiết bị           │
├─────────────────────────────┤
│ ❌ Hết thời gian chờ        │
│                             │
│ Không tìm thấy thiết bị...   │
│ Vui lòng thử lại.            │
├─────────────────────────────┤
│ [Đóng] [Thử lại]            │
└─────────────────────────────┘
```

**Luồng WebSocket:**
1. User click "Bắt đầu tìm kiếm" → Gửi `iot/device/pair` với `gardenId`
2. Bắt đầu đếm ngược 4 phút
3. Lắng nghe event `iot/garden/pair`:
   - `status: 'pair_success'` → Hiển thị success, lưu deviceMac
   - `status: 'pair_timeout'` → Hiển thị timeout, cho phép thử lại
4. User click "Lưu" → Callback `onPairSuccess` → Refresh garden data

---

### 1.4 SensorDataDisplay Component
**File:** `src/components/SensorData/SensorDataDisplay.jsx`

**Chức năng:**
- Component tái sử dụng để hiển thị dữ liệu sensor
- Có thể hiển thị điều khiển bơm (tùy chọn)

**Props:**
- `deviceMac`: MAC address của device
- `showControls`: Hiển thị nút điều khiển bơm (default: false)

---

## 2. WebSocket Flows

### 2.1 Luồng Join Garden Room

```
User Action: Click vào garden có deviceMac
    ↓
GardenDashboard mount
    ↓
useWebSocket hook connect
    ↓
WebSocket connected
    ↓
joinGarden(deviceMac) called
    ↓
Emit: 'iot/garden/join' { deviceMac }
    ↓
Server Response: {
  status: 'joined',
  initialData: {
    sensors: {...},
    pumpStatus: 'ON' | 'OFF' | 'AUTO',
    updatedAt: string
  }
}
    ↓
Update UI với initialData
    ↓
Listen: 'iot/sensor' event
    ↓
Update UI realtime khi có dữ liệu mới
```

### 2.2 Luồng Điều khiển Bơm

```
User Action: Click button BẬT/TẮT/TỰ ĐỘNG
    ↓
handlePumpControl(action)
    ↓
controlPump(deviceMac, action)
    ↓
Emit: 'iot/device/pump' {
  deviceMac: string,
  action: 'ON' | 'OFF' | 'AUTO'
}
    ↓
Server xử lý:
  - Validate quyền
  - Publish MQTT command
  - Update DB
    ↓
Server Response: { status: 'success' }
    ↓
Update local state
    ↓
Toast notification: "Đã bật/tắt/chuyển sang tự động bơm"
    ↓
Listen: 'pumpStatusUpdate' event (optional)
    ↓
Update UI với trạng thái mới
```

### 2.3 Luồng Pairing Thiết bị

```
User Action: Click "Thêm thiết bị"
    ↓
PairDeviceModal mở
    ↓
User click "Bắt đầu tìm kiếm"
    ↓
startPairing(gardenId)
    ↓
Emit: 'iot/device/pair' { gardenId }
    ↓
Server Response: { status: 'pairing_mode_active' }
    ↓
Bắt đầu đếm ngược 4 phút
    ↓
[User nhấn nút trên ESP32]
    ↓
Device gửi MQTT pairing request
    ↓
Server xử lý và pair device với garden
    ↓
Emit: 'iot/garden/pair' {
  status: 'pair_success',
  gardenId: number,
  deviceMac: string
}
    ↓
PairDeviceModal nhận event
    ↓
Hiển thị success message
    ↓
User click "Lưu"
    ↓
onPairSuccess callback
    ↓
Refresh garden data
    ↓
Tự động điều hướng đến dashboard
```

---

## 3. UI/UX Best Practices

### 3.1 Loading States
- Hiển thị `CircularProgress` khi đang fetch data
- Hiển thị skeleton loader cho sensor cards
- Disable buttons khi đang xử lý request

### 3.2 Error Handling
- Hiển thị `Alert` với severity="error" khi có lỗi
- Toast notification cho các action thành công/thất bại
- Retry button cho các lỗi có thể retry

### 3.3 Real-time Updates
- Sử dụng WebSocket để cập nhật realtime
- Hiển thị timestamp của dữ liệu cuối cùng
- Visual indicator khi có dữ liệu mới (optional)

### 3.4 Responsive Design
- Grid layout responsive với breakpoints:
  - xs: 12 columns (full width)
  - sm: 6 columns (half width)
  - md: 4 columns (third width)
- Buttons wrap trên mobile
- Dialog fullWidth trên mobile

### 3.5 Accessibility
- Icon buttons có tooltip
- Color contrast đạt WCAG AA
- Keyboard navigation support
- ARIA labels cho screen readers

---

## 4. Component Dependencies

```
GardenDashboard
├── useWebSocket hook
│   └── websocketService
├── gardenAPI (REST)
├── PairDeviceModal
│   └── useWebSocket hook
│       └── websocketService
└── Material-UI components

GardenList
├── gardenAPI (REST)
├── PairDeviceModal
└── useNavigate (React Router)
```

---

## 5. WebSocket Events Mapping

| Event Name | Direction | Payload | Description |
|------------|-----------|---------|-------------|
| `iot/garden/join` | Client → Server | `{ deviceMac: string }` | Join garden room để nhận dữ liệu |
| `iot/sensor` | Server → Client | `{ temperature, humidity, soilMoisture, pumpStatus, timestamp }` | Dữ liệu sensor realtime |
| `iot/device/pump` | Client → Server | `{ deviceMac: string, action: 'ON'\|'OFF'\|'AUTO' }` | Điều khiển bơm |
| `iot/device/pair` | Client → Server | `{ gardenId: number }` | Bắt đầu pairing mode |
| `iot/garden/pair` | Server → Client | `{ status: 'pair_success'\|'pair_timeout', gardenId?, deviceMac?, message? }` | Kết quả pairing |

---

## 6. State Management

### 6.1 GardenDashboard State
```javascript
{
  garden: {
    id: number,
    name: string,
    location: string,
    area: number,
    deviceMac: string | null,
    ...
  },
  loading: boolean,
  error: string | null,
  pairDialogOpen: boolean,
  connected: boolean,        // WebSocket connection
  sensorData: object | null, // Realtime sensor data
  pumpStatus: string,        // 'ON' | 'OFF' | 'AUTO'
  initialData: object | null // Initial data from join
}
```

### 6.2 PairDeviceModal State
```javascript
{
  timeRemaining: number,     // Seconds (240 = 4 minutes)
  isPairing: boolean,
  pairingStatus: string,     // 'pairing' | 'success' | 'timeout' | 'error'
  deviceMac: string | null,
  connected: boolean
}
```

---

## 7. Color Scheme & Theming

### 7.1 Sensor Cards
- **Temperature**: Red (`error` color)
- **Humidity**: Blue (`primary` color)
- **Soil Moisture**: Green (`success` color)

### 7.2 Pump Status
- **ON**: Green (`success` color)
- **OFF**: Red (`error` color)
- **AUTO**: Gray (`default` color)

### 7.3 Connection Status
- **Connected**: Green chip
- **Disconnected**: Gray chip
- **Connecting**: Loading spinner

---

## 8. Performance Considerations

1. **WebSocket Connection**: Singleton pattern để tránh multiple connections
2. **Memoization**: Sử dụng `useCallback` cho event handlers
3. **Lazy Loading**: Code splitting cho các components lớn
4. **Debouncing**: Debounce cho các input fields (nếu có)
5. **Cleanup**: Proper cleanup trong useEffect để tránh memory leaks

---

## 9. Testing Scenarios

### 9.1 Garden Dashboard
- [ ] Load garden data successfully
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Join WebSocket room when deviceMac exists
- [ ] Display sensor data realtime
- [ ] Control pump successfully
- [ ] Handle WebSocket disconnection
- [ ] Show "Add Device" when no deviceMac

### 9.2 Pairing Flow
- [ ] Open pairing modal
- [ ] Start pairing successfully
- [ ] Countdown timer works correctly
- [ ] Handle pairing success
- [ ] Handle pairing timeout
- [ ] Handle pairing error
- [ ] Retry pairing after timeout
- [ ] Save and refresh garden after success

### 9.3 Garden List
- [ ] Display list of gardens
- [ ] Create new garden
- [ ] Edit garden
- [ ] Delete garden
- [ ] Navigate to dashboard
- [ ] Show deviceMac status
- [ ] Open pairing modal

---

## 10. Future Enhancements

1. **Charts**: Hiển thị biểu đồ lịch sử sensor data
2. **Notifications**: Push notification khi sensor vượt ngưỡng
3. **Scheduling**: Lập lịch điều khiển bơm tự động
4. **Multi-device**: Hỗ trợ nhiều device cho một garden
5. **Device Management**: Quản lý danh sách devices
6. **Offline Mode**: Cache data và sync khi online lại

---

## 11. File Structure

```
src/
├── components/
│   ├── Gardens/
│   │   ├── GardenList.jsx          # Danh sách gardens
│   │   ├── GardenDashboard.jsx     # Dashboard của garden
│   │   ├── GardenDetail.jsx        # Dialog chi tiết (legacy)
│   │   └── PairDeviceModal.jsx     # Modal pairing thiết bị
│   └── SensorData/
│       └── SensorDataDisplay.jsx   # Component hiển thị sensor
├── hooks/
│   └── useWebSocket.js             # Hook quản lý WebSocket
├── services/
│   ├── api.js                      # REST API services
│   └── websocket.js                # WebSocket service
└── contexts/
    └── SocketContext.js            # Socket context (legacy)
```

---

## 12. API Endpoints Used

### REST APIs
- `GET /garden` - Lấy danh sách gardens
- `GET /garden/:id` - Lấy thông tin garden theo ID
- `POST /garden` - Tạo garden mới
- `PUT /garden/:id` - Cập nhật garden
- `DELETE /garden/:id` - Xóa garden

### WebSocket Events
- `iot/garden/join` - Join garden room
- `iot/sensor` - Nhận dữ liệu sensor
- `iot/device/pump` - Điều khiển bơm
- `iot/device/pair` - Bắt đầu pairing
- `iot/garden/pair` - Kết quả pairing

---

*Tài liệu này được tạo tự động dựa trên code hiện có trong fe_dashboard.*
