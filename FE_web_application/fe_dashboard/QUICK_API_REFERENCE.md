# ⚡ Quick API Reference - Frontend

## 📦 Response Format

Backend có `TransformResponseInterceptor` nên response sẽ có format:

```json
{
  "HttpCode": 200,
  "success": true,
  "data": { ... },  // Dữ liệu thực tế ở đây
  "timestamp": "2024-12-20T10:00:00.000Z"
}
```

**⚠️ Quan trọng:** Dữ liệu thực tế nằm trong `response.data.data`, không phải `response.data`!

---

## 🔑 Authentication

### Login và Lưu Token

```javascript
import { authAPI } from "../services/api";

const response = await authAPI.login("admin@example.com", "password123");

// Lưu token
localStorage.setItem("token", response.data.data.access_token);
// Hoặc nếu không có interceptor:
// localStorage.setItem("token", response.data.access_token);
```

---

## 📝 Quick Examples

### 1. Lấy Danh Sách (GET)

```javascript
import { gardenAPI } from "../services/api";

// ✅ Đúng - Xử lý response format
const response = await gardenAPI.getAll();
const gardens = response.data?.data || response.data || [];

// ❌ Sai
const gardens = response.data; // Có thể không đúng
```

### 2. Tạo Mới (POST)

```javascript
import { gardenAPI } from "../services/api";

const response = await gardenAPI.create({
  name: "Vườn A",
  area: 100.5,
  location: "Hà Nội"
});

// Response có thể là object mới được tạo
const newGarden = response.data?.data || response.data;
```

### 3. Cập Nhật (PATCH/PUT)

```javascript
import { vegetableAPI } from "../services/api";

await vegetableAPI.updatePrice(1, 35000);
// Thường không cần xử lý response
```

### 4. Xóa (DELETE)

```javascript
import { gardenAPI } from "../services/api";

await gardenAPI.delete(1);
// Thường không cần xử lý response
```

---

## 🎯 Pattern Chuẩn

### Pattern 1: Fetch Data với Loading

```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiFunction();
      // Xử lý response format
      const result = response.data?.data || response.data || [];
      setData(Array.isArray(result) ? result : [result]);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Pattern 2: Create với Form

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await apiFunction.create(formData);
    // Success
    alert("Thành công!");
    // Reset form hoặc redirect
  } catch (err) {
    setError(err.response?.data?.message || "Lỗi");
  } finally {
    setLoading(false);
  }
};
```

---

## 🔍 Debug Response

```javascript
// Log để xem structure
const response = await gardenAPI.getAll();
console.log("Full response:", response);
console.log("Response.data:", response.data);
console.log("Response.data.data:", response.data?.data);

// Sử dụng
const gardens = response.data?.data || response.data || [];
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Response Format:** Luôn kiểm tra `response.data.data` trước
2. **Array Check:** Luôn đảm bảo là array: `Array.isArray(data) ? data : []`
3. **Error Handling:** Luôn có try-catch
4. **Loading State:** Luôn có loading state
5. **Token:** Tự động được thêm, không cần thêm thủ công

---

## 📚 Tất Cả APIs

Xem file `FRONTEND_API_GUIDE.md` để biết chi tiết tất cả APIs.

Xem file `API_USAGE_EXAMPLES.md` để xem ví dụ cụ thể.

Xem file `TROUBLESHOOTING_API.md` nếu gặp lỗi.



