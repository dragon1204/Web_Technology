# 📁 Tài liệu API Module Storage (File Management)

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Cấu hình](#cấu-hình)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Ví dụ sử dụng](#ví-dụ-sử-dụng)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Tổng quan

Module Storage cung cấp các API để quản lý files sử dụng MinIO object storage. Hỗ trợ upload, download, xóa và quản lý files với các tính năng:

- ✅ Upload single/multiple files
- ✅ Download files với stream
- ✅ Presigned URLs (tạm thời)
- ✅ File metadata và info
- ✅ List files theo folder
- ✅ Delete files
- ✅ Role-based access control

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Tất cả các API đều yêu cầu Bearer Token trong header:

```http
Authorization: Bearer <access_token>
```

**Lấy token:** Đăng nhập qua API `/auth/login` để nhận `access_token`

---

## Cấu hình

### Environment Variables

Thêm vào file `.env`:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=files
```

### File Size Limits

Mặc định không giới hạn. Để cấu hình, thêm vào `main.ts`:

```typescript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### Supported File Types

- **Images:** jpg, jpeg, png, gif, webp, svg
- **Documents:** pdf, doc, docx, xls, xlsx, txt
- **Videos:** mp4, avi, mov, webm
- **Others:** zip, rar, json, xml

---

## API Endpoints

### 1. 📤 Upload Single File

**POST** `/storage/upload`

**Role:** `CUSTOMER`, `USER`, `ADMIN`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | ✅ Yes | File cần upload |
| `folder` | String | ❌ No | Thư mục lưu trữ (mặc định: `uploads`) |
| `fileName` | String | ❌ No | Tên file tùy chỉnh (nếu không có sẽ dùng tên gốc + timestamp) |

**Response:**
```json
{
  "message": "File uploaded successfully",
  "data": {
    "url": "http://localhost:9000/files/avatars/1704067200000-avatar.jpg?X-Amz-Algorithm=...",
    "fileName": "avatars/1704067200000-avatar.jpg",
    "size": 102400,
    "originalName": "avatar.jpg",
    "mimeType": "image/jpeg",
    "uploadedBy": 1,
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=avatars" \
  -F "fileName=my-avatar.jpg"
```

---

### 2. 📤 Upload Multiple Files

**POST** `/storage/upload/multiple`

**Role:** `CUSTOMER`, `USER`, `ADMIN`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `files` | File[] | ✅ Yes | Danh sách files (tối đa 10 files) |
| `folder` | String | ❌ No | Thư mục lưu trữ |

**Response:**
```json
{
  "message": "3 files uploaded successfully",
  "data": [
    {
      "url": "http://localhost:9000/files/products/1704067200000-image1.jpg?...",
      "fileName": "products/1704067200000-image1.jpg",
      "size": 102400,
      "originalName": "image1.jpg",
      "mimeType": "image/jpeg",
      "uploadedBy": 1,
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "url": "http://localhost:9000/files/products/1704067201000-image2.jpg?...",
      "fileName": "products/1704067201000-image2.jpg",
      "size": 204800,
      "originalName": "image2.jpg",
      "mimeType": "image/png",
      "uploadedBy": 1,
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/storage/upload/multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg" \
  -F "files=@/path/to/image3.jpg" \
  -F "folder=products"
```

---

### 3. 📥 Download File

**GET** `/storage/download/:fileName`

**Role:** `CUSTOMER`, `USER`, `ADMIN`

**Path Parameters:**
- `fileName` (string): Tên file hoặc đường dẫn (có thể bao gồm thư mục)
  - Example: `avatars/1704067200000-avatar.jpg`
  - Example: `products/image.jpg`

**Response:** File stream với headers:
- `Content-Type`: MIME type của file
- `Content-Length`: Kích thước file (bytes)
- `Content-Disposition`: Tên file khi download

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/storage/download/avatars/1704067200000-avatar.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output downloaded-avatar.jpg
```

---

### 4. 🔗 Get Presigned URL

**GET** `/storage/url/:fileName?expiry=604800`

**Role:** `CUSTOMER`, `USER`, `ADMIN`

**Path Parameters:**
- `fileName` (string): Tên file

**Query Parameters:**
- `expiry` (number, optional): Thời gian hết hạn tính bằng giây
  - Mặc định: `604800` (7 ngày)
  - Tối đa: `604800` (7 ngày)
  - Tối thiểu: `60` (1 phút)

**Response:**
```json
{
  "message": "File URL generated successfully",
  "data": {
    "url": "http://localhost:9000/files/avatars/1704067200000-avatar.jpg?X-Amz-Algorithm=...",
    "fileName": "avatars/1704067200000-avatar.jpg",
    "expiry": 604800,
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

**Use Case:** Dùng để hiển thị hình ảnh trong frontend mà không cần download trực tiếp.

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/storage/url/avatars/1704067200000-avatar.jpg?expiry=3600" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. ℹ️ Get File Info

**GET** `/storage/info/:fileName`

**Role:** `CUSTOMER`, `USER`, `ADMIN`

**Path Parameters:**
- `fileName` (string): Tên file

**Response:**
```json
{
  "message": "File info retrieved successfully",
  "data": {
    "fileName": "avatars/1704067200000-avatar.jpg",
    "size": 102400,
    "contentType": "image/jpeg",
    "originalName": "avatar.jpg",
    "lastModified": "2024-01-01T00:00:00.000Z",
    "etag": "\"abc123def456\""
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/storage/info/avatars/1704067200000-avatar.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. 📋 List Files

**GET** `/storage/list?folder=avatars&recursive=true`

**Role:** `CUSTOMER`, `USER`, `ADMIN`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `folder` | String | ❌ No | `root` | Lọc theo thư mục |
| `recursive` | Boolean | ❌ No | `true` | Tìm kiếm đệ quy trong các thư mục con |

**Response:**
```json
{
  "message": "Files listed successfully",
  "data": {
    "files": [
      {
        "name": "avatars/1704067200000-avatar1.jpg",
        "size": 102400,
        "lastModified": "2024-01-01T00:00:00.000Z",
        "isDir": false
      },
      {
        "name": "avatars/1704067201000-avatar2.jpg",
        "size": 204800,
        "lastModified": "2024-01-02T00:00:00.000Z",
        "isDir": false
      }
    ],
    "total": 2,
    "folder": "avatars"
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/storage/list?folder=avatars&recursive=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. 🗑️ Delete File

**DELETE** `/storage/delete/:fileName`

**Role:** `USER`, `ADMIN` ⚠️

**Path Parameters:**
- `fileName` (string): Tên file cần xóa

**Response:**
```json
{
  "message": "File deleted successfully",
  "data": {
    "fileName": "avatars/1704067200000-avatar.jpg",
    "deletedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:3000/storage/delete/avatars/1704067200000-avatar.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. 🗑️ Delete Multiple Files

**DELETE** `/storage/delete/multiple?fileNames=file1.jpg&fileNames=file2.jpg`

**Role:** `USER`, `ADMIN` ⚠️

**Query Parameters:**
- `fileNames` (string[]): Danh sách tên files cần xóa

**Response:**
```json
{
  "message": "2 files deleted successfully",
  "data": {
    "fileNames": [
      "avatars/file1.jpg",
      "avatars/file2.jpg"
    ],
    "deletedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:3000/storage/delete/multiple?fileNames=avatars/file1.jpg&fileNames=avatars/file2.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 9. ✅ Check File Exists

**GET** `/storage/exists/:fileName`

**Role:** `CUSTOMER`, `USER`, `ADMIN`

**Path Parameters:**
- `fileName` (string): Tên file

**Response:**
```json
{
  "message": "File existence checked",
  "data": {
    "fileName": "avatars/1704067200000-avatar.jpg",
    "exists": true
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/storage/exists/avatars/1704067200000-avatar.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Ví dụ sử dụng

### React với Axios

#### 1. Upload Avatar

```typescript
import axios from 'axios';

const uploadAvatar = async (file: File, userId: number, token: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'avatars');
  formData.append('fileName', `user-${userId}.jpg`);

  const response = await axios.post(
    'http://localhost:3000/storage/upload',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data.url; // Lưu URL này vào database
};
```

#### 2. Upload Multiple Product Images

```typescript
const uploadProductImages = async (files: File[], token: string) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('folder', 'products');

  const response = await axios.post(
    'http://localhost:3000/storage/upload/multiple',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data.map((item: any) => item.url);
};
```

#### 3. Hiển thị ảnh với Presigned URL

```typescript
const getImageUrl = async (fileName: string, token: string) => {
  const response = await axios.get(
    `http://localhost:3000/storage/url/${fileName}?expiry=3600`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  return response.data.data.url;
};

// Sử dụng trong component
const ImageComponent = ({ fileName }: { fileName: string }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    getImageUrl(fileName, token).then(setImageUrl);
  }, [fileName]);

  return <img src={imageUrl} alt="Product" />;
};
```

#### 4. Download File

```typescript
const downloadFile = async (fileName: string, token: string) => {
  const response = await axios.get(
    `http://localhost:3000/storage/download/${fileName}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      responseType: 'blob',
    }
  );

  // Tạo URL và download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

### JavaScript Fetch API

```javascript
// Upload file
const uploadFile = async (file, folder = 'uploads') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('http://localhost:3000/storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.data.url;
};
```

### Vue.js với Axios

```vue
<template>
  <div>
    <input type="file" @change="handleFileUpload" />
    <button @click="upload">Upload</button>
    <img v-if="imageUrl" :src="imageUrl" alt="Uploaded" />
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      file: null,
      imageUrl: '',
      token: 'YOUR_TOKEN',
    };
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    async upload() {
      const formData = new FormData();
      formData.append('file', this.file);
      formData.append('folder', 'avatars');

      const response = await axios.post(
        'http://localhost:3000/storage/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      this.imageUrl = response.data.data.url;
    },
  },
};
</script>
```

---

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "File không được upload",
  "error": "Bad Request"
}
```

### Common Error Codes

| Status Code | Description | Solution |
|------------|-------------|----------|
| `400` | Bad Request | Kiểm tra file đã được upload, MinIO đã cấu hình |
| `401` | Unauthorized | Token không hợp lệ hoặc đã hết hạn |
| `403` | Forbidden | Không có quyền truy cập (ví dụ: CUSTOMER không thể xóa file) |
| `404` | Not Found | File không tồn tại |
| `500` | Internal Server Error | Lỗi server, kiểm tra logs |

### Error Handling Example

```typescript
try {
  const response = await axios.post('/storage/upload', formData, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  console.log('Upload success:', response.data);
} catch (error) {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        console.error('Bad request:', error.response.data.message);
        break;
      case 401:
        console.error('Unauthorized: Please login again');
        // Redirect to login
        break;
      case 403:
        console.error('Forbidden: You do not have permission');
        break;
      case 404:
        console.error('File not found');
        break;
      default:
        console.error('Server error:', error.response.data);
    }
  }
}
```

---

## Best Practices

### 1. Folder Organization

Sử dụng các thư mục sau để tổ chức files:

```
avatars/          # Ảnh đại diện người dùng
products/         # Ảnh sản phẩm
documents/        # Tài liệu
temp/             # Files tạm thời (có thể xóa sau)
uploads/          # Uploads chung
```

### 2. File Naming

- ✅ Sử dụng timestamp để tránh trùng tên
- ✅ Sanitize tên file (loại bỏ ký tự đặc biệt)
- ✅ Giữ extension gốc của file

### 3. Presigned URLs

- Sử dụng presigned URLs cho images trong frontend
- Set expiry phù hợp (1 giờ cho images, 7 ngày cho documents)
- Không lưu presigned URLs vào database (chúng sẽ hết hạn)

### 4. File Size

- Giới hạn kích thước file phù hợp:
  - Images: 5MB
  - Documents: 10MB
  - Videos: 50MB

### 5. Security

- ✅ Validate file type trước khi upload
- ✅ Scan files cho malware (nếu cần)
- ✅ Chỉ USER và ADMIN mới có quyền xóa
- ✅ CUSTOMER chỉ có thể upload/download

### 6. Performance

- Sử dụng presigned URLs thay vì download trực tiếp
- Compress images trước khi upload
- Lazy load images trong frontend

---

## Thư mục được khuyến nghị

| Thư mục | Mô tả | Use Case |
|---------|-------|----------|
| `avatars` | Ảnh đại diện | User profile pictures |
| `products` | Ảnh sản phẩm | Product images, thumbnails |
| `documents` | Tài liệu | PDFs, contracts, reports |
| `uploads` | Uploads chung | General file uploads |
| `temp` | Files tạm thời | Temporary files (có thể xóa sau) |

---

## Lưu ý quan trọng

1. **File Size Limit:** Cấu hình trong `main.ts` nếu cần giới hạn
2. **Presigned URL Expiry:** Mặc định 7 ngày, có thể điều chỉnh
3. **File Naming:** Tự động sanitize và thêm timestamp
4. **Bucket:** Tự động tạo nếu chưa tồn tại
5. **Security:** Role-based access control đã được implement
6. **Multiple Upload:** Tối đa 10 files mỗi lần upload

---

## Troubleshooting

### MinIO không kết nối được

```bash
# Kiểm tra MinIO đang chạy
curl http://localhost:9000/minio/health/live

# Kiểm tra cấu hình .env
cat .env | grep MINIO
```

### Upload bị lỗi

- Kiểm tra file size không vượt quá limit
- Kiểm tra file type được hỗ trợ
- Kiểm tra token còn hợp lệ

### Presigned URL hết hạn

- Tạo lại URL mới
- Tăng expiry time nếu cần
- Lưu fileName thay vì URL vào database

---

## Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs server
2. Kiểm tra MinIO console: `http://localhost:9001`
3. Xem error response từ API
