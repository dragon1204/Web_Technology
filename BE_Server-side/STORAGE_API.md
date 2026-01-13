## Storage API Documentation

Module Storage sử dụng MinIO để lưu trữ file (avatar, ảnh sản phẩm, tài liệu).  
Base URL backend mặc định: `http://localhost:3000/storage`

- **Bucket mặc định** trong MinIO: `files`
- **Đường dẫn file bên trong bucket**: ví dụ `avatars/user-12.jpg`, `products/123-abc.jpg`
- **Auth**:
  - Các API quản lý (upload, list, delete, info, url, exists, download) **cần Bearer token**
  - API **view file `/storage/view/*` là public**, dùng để FE nhúng ảnh trong `<img>` mà không cần gửi token

---

## 1. Upload 1 file

- **Method**: `POST`
- **URL**: `/storage/upload`
- **Auth**: Bearer token (ROLE: `ADMIN`, `USER`, `CUSTOMER`)

### Headers

- `Content-Type: multipart/form-data`
- `Authorization: Bearer <access_token>`

### Body (form-data)

- **file** (bắt buộc): file binary
- **folder** (tuỳ chọn):
  - Thư mục lưu trong bucket, ví dụ: `avatars`, `products`, `documents`
  - Nếu không gửi: mặc định `uploads`
- **fileName** (tuỳ chọn):
  - Tên file tùy chọn, ví dụ: `user-12.jpg`
  - Nếu không gửi: BE tự sinh `folder/<timestamp>-<originalName>`

> Lưu ý: `folder` có thể đi qua body hoặc query vì BE nhận bằng `@Query() dto: UploadFileDto`

### Response 200

```json
{
  "message": "File uploaded successfully",
  "data": {
    "url": "https://...presigned-or-view-url",
    "fileName": "avatars/user-12.jpg",
    "size": 12345,
    "originalName": "avatar.jpg",
    "mimeType": "image/jpeg",
    "uploadedBy": 12,
    "uploadedAt": "2026-01-12T..."
  }
}
```

### Gợi ý FE (avatar)

- Gửi:
  - `folder=avatars`
  - `fileName=user-<userId>.jpg`
- Đường dẫn lưu trong DB / field user: `avatars/user-<userId>.jpg`

---

## 2. Upload nhiều file

- **Method**: `POST`
- **URL**: `/storage/upload/multiple`
- **Auth**: Bearer token (ROLE: `ADMIN`, `USER`, `CUSTOMER`)

### Headers

- `Content-Type: multipart/form-data`
- `Authorization: Bearer <access_token>`

### Body (form-data)

- **files**: (array) nhiều file, key `files` lặp nhiều lần
- **folder** (tuỳ chọn): ví dụ `products`

### Response 200

```json
{
  "message": "3 files uploaded successfully",
  "data": [
    {
      "url": "...",
      "fileName": "products/...",
      "size": 123,
      "originalName": "a.jpg",
      "mimeType": "image/jpeg",
      "uploadedBy": 12,
      "uploadedAt": "..."
    }
  ]
}
```

### Use-case

- Upload nhiều ảnh sản phẩm cho 1 product

---

## 3. Lấy URL để hiển thị ảnh (proxy qua BE)

### 3.1. API lấy URL hiển thị

- **Method**: `GET`
- **URL**: `/storage/url/{filePath}`
- **Auth**: Bearer token (ROLE: `ADMIN`, `USER`, `CUSTOMER`)

#### Headers

- `Authorization: Bearer <access_token>`

#### Path param

- `{filePath}` là đường dẫn nội bộ trong bucket, **được encode**:
  - File thực tế: `avatars/user-12.jpg`
  - Gọi API: `/storage/url/avatars%2Fuser-12.jpg`

#### Query params

- `expiry` (optional): số giây hết hạn, hiện giữ lại cho tương thích.  
  URL trả về là backend proxy `/storage/view/*` nên FE không cần quan tâm nhiều tới expiry.

#### Response 200

```json
{
  "message": "File URL generated successfully",
  "data": {
    "url": "http://localhost:3000/storage/view/avatars%2Fuser-12.jpg",
    "fileName": "avatars/user-12.jpg",
    "expiry": 604800,
    "expiresAt": "2026-01-19T..."
  }
}
```

### 3.2. API view file (dùng trực tiếp trong `<img>`)

- **Method**: `GET`
- **URL**: `/storage/view/{filePathEncoded}`
- **Auth**: **Không cần** token (public)

#### Path param

- `{filePathEncoded}` là đường dẫn đã encode:
  - `avatars%2Fuser-12.jpg`

#### Hành vi

1. BE decode path → `avatars/user-12.jpg`
2. Gọi `MinioService.fileExists(fileName)`:
   - Nếu **không tồn tại**:
     - Trả `404`:
       ```json
       { "message": "File not found" }
       ```
   - Nếu tồn tại:
     - Stream file ra:
       - `Content-Type`: từ metadata `content-type` (vd `image/jpeg`)
       - `Content-Length`
       - `Content-Disposition: inline; filename="original-name.ext"`

#### FE cách dùng

- FE **không** gọi trực tiếp `/storage/view/...` mà đi theo 2 bước:
  1. Gọi `GET /storage/url/{encodeURIComponent(fileName)}` để lấy URL.
  2. Lấy `data.url` trong response và bind vào:
     - `<img src={url} />`
     - `<Avatar src={url} />` (MUI)

Ví dụ:

- File trong DB: `avatars/user-12.jpg`
- FE:
  - Gọi `/storage/url/avatars%2Fuser-12.jpg`
  - Lấy `url = "http://localhost:3000/storage/view/avatars%2Fuser-12.jpg"`
  - `<img src={url} alt="avatar" />`

---

## 4. Download file (attachment)

- **Method**: `GET`
- **URL**: `/storage/download/{filePath}`
- **Auth**: Bearer token (ROLE: `ADMIN`, `USER`, `CUSTOMER`)

### Headers

- `Authorization: Bearer <access_token>`

### Path param

- `{filePath}` encode:
  - File: `documents/report.pdf`
  - URL: `/storage/download/documents%2Freport.pdf`

### Response

- Stream binary:
  - `Content-Type`: loại file
  - `Content-Length`
  - `Content-Disposition: attachment; filename="original-name.ext"`  
    → trình duyệt hiểu là tải xuống

### Gợi ý FE

- Nếu dùng Axios:

```js
axios.get('/storage/download/' + encodeURIComponent(fileName), {
  responseType: 'blob',
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## 5. Lấy thông tin file (metadata)

- **Method**: `GET`
- **URL**: `/storage/info/{filePath}`
- **Auth**: Bearer token

### Headers

- `Authorization: Bearer <access_token>`

### Response 200

```json
{
  "message": "File info retrieved successfully",
  "data": {
    "fileName": "avatars/user-12.jpg",
    "size": 12345,
    "contentType": "image/jpeg",
    "originalName": "avatar.jpg",
    "lastModified": "2026-01-12T...",
    "etag": "..."
  }
}
```

---

## 6. Liệt kê file

- **Method**: `GET`
- **URL**: `/storage/list`
- **Auth**: Bearer token

### Headers

- `Authorization: Bearer <access_token>`

### Query params

- `folder` (optional): thư mục, ví dụ `avatars`, `products`
  - Nếu không gửi: root bucket
- `recursive` (optional, boolean, default `true`):
  - `true`: duyệt đệ quy
  - `false`: chỉ thư mục hiện tại

### Response 200

```json
{
  "message": "Files listed successfully",
  "data": {
    "files": [
      {
        "name": "avatars/user-12.jpg",
        "size": 12345,
        "lastModified": "2026-01-12T...",
        "isDir": false
      },
      {
        "name": "avatars/",
        "size": 0,
        "lastModified": "...",
        "isDir": true
      }
    ],
    "total": 2,
    "folder": "avatars"
  }
}
```

---

## 7. Xoá file

### 7.1. Xoá 1 file

- **Method**: `DELETE`
- **URL**: `/storage/delete/{filePath}`
- **Auth**: Bearer token (ROLE: `USER`, `ADMIN`)

#### Path param

- `{filePath}` encode: `avatars%2Fuser-12.jpg`

#### Response 200

```json
{
  "message": "File deleted successfully",
  "data": {
    "fileName": "avatars/user-12.jpg",
    "deletedAt": "2026-01-12T..."
  }
}
```

### 7.2. Xoá nhiều file

- **Method**: `DELETE`
- **URL**: `/storage/delete/multiple`
- **Auth**: Bearer token (ROLE: `USER`, `ADMIN`)

#### Query params

- `fileNames`: nhiều lần:
  - `?fileNames=avatars/user-12.jpg&fileNames=products/p1.jpg`

#### Response 200

```json
{
  "message": "2 files deleted successfully",
  "data": {
    "fileNames": [
      "avatars/user-12.jpg",
      "products/p1.jpg"
    ],
    "deletedAt": "2026-01-12T..."
  }
}
```

---

## 8. Kiểm tra file tồn tại

- **Method**: `GET`
- **URL**: `/storage/exists/{filePath}`
- **Auth**: Bearer token (ROLE: `ADMIN`, `USER`, `CUSTOMER`)

### Path param

- `{filePath}` encode: `avatars%2Fuser-12.jpg`

### Response 200

```json
{
  "message": "File existence checked",
  "data": {
    "fileName": "avatars/user-12.jpg",
    "exists": true
  }
}
```

### Gợi ý FE

- Trước khi hiển thị avatar:
  - Gọi `/storage/exists/{encodeURIComponent('avatars/user-<id>.jpg')}`
  - Nếu `exists === true` → gọi `/storage/url/...` để lấy URL ảnh
  - Nếu `exists === false` → hiển thị ảnh default

---

## 9. Mapping nhanh với `storageService.js` trên FE

Giả sử `API_BASE_URL = "http://localhost:3000"`.

- **Upload 1 file**

```js
// POST /storage/upload
storageService.uploadFile(file, folder, fileName);
```

- **Upload nhiều file**

```js
// POST /storage/upload/multiple
storageService.uploadMultipleFiles(files, folder);
```

- **Lấy URL hiển thị**

```js
// GET /storage/url/{encodeURIComponent(fileName)}
const url = await storageService.getFileUrl('avatars/user-12.jpg');
// <img src={url} />
```

- **Download**

```js
// GET /storage/download/{encodeURIComponent(fileName)}
const blob = await storageService.downloadFile('documents/report.pdf');
```

- **Info**

```js
// GET /storage/info/{encodeURIComponent(fileName)}
const info = await storageService.getFileInfo('avatars/user-12.jpg');
```

- **List**

```js
// GET /storage/list?folder=avatars&recursive=true
const list = await storageService.listFiles('avatars', true);
```

- **Delete 1 / nhiều**

```js
// DELETE /storage/delete/{encodeURIComponent(fileName)}
await storageService.deleteFile('avatars/user-12.jpg');

// DELETE /storage/delete/multiple?fileNames=...
await storageService.deleteMultipleFiles([
  'avatars/user-12.jpg',
  'products/p1.jpg',
]);
```

- **Exists**

```js
// GET /storage/exists/{encodeURIComponent(fileName)}
const existence = await storageService.fileExists('avatars/user-12.jpg');
// existence.data.exists hoặc existence.exists (tùy cách parse)
```

- **Helper avatar**

```js
// Upload avatar: folder 'avatars', fileName 'user-<id>.jpg'
await storageService.uploadAvatar(file, userId);

// Lấy URL ảnh:
const avatarUrl = await storageService.getImageUrl(`avatars/user-${userId}.jpg`);
```

