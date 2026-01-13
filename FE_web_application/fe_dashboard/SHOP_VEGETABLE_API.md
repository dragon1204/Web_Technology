# Shop Vegetable Management API - Tài liệu cho Frontend

## Tổng quan

Tài liệu này mô tả các API endpoints để **USER (Garden Manager)** quản lý các loại rau trong shop của mình.

**Base URL**: `http://localhost:3000` (hoặc domain production)

**Authentication**: Tất cả endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <access_token>
```

**Role Required**: `USER` hoặc `ADMIN`

---

## 1. Lấy danh sách rau có thể thêm vào shop

Lấy danh sách các loại rau từ gardens của user, có thể thêm vào shop. API này sẽ tự động loại trừ các rau đã có trong shop.

### Endpoint
```
GET /shop/:shopId/available-vegetables
```

### Path Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `shopId` | number | Yes | ID của shop |

### Headers
```
Authorization: Bearer <access_token>
```

### Response

**Success (200 OK)**
```json
[
  {
    "vegetable": {
      "id": 1,
      "name": "Rau muống",
      "imported": 100,
      "sold": 50,
      "price": 25000,
      "category": "leafy",
      "description": "Rau muống tươi ngon",
      "image": "http://localhost:3000/storage/view/vegetables/rau-muong.jpg",
      "createdAt": "2026-01-10T10:00:00.000Z",
      "updatedAt": "2026-01-12T15:30:00.000Z"
    },
    "gardens": [
      {
        "gardenId": 1,
        "gardenName": "Vườn rau nhà tôi",
        "quantity": 150
      },
      {
        "gardenId": 2,
        "gardenName": "Vườn rau phụ",
        "quantity": 80
      }
    ]
  },
  {
    "vegetable": {
      "id": 2,
      "name": "Rau cải",
      "imported": 200,
      "sold": 100,
      "price": 30000,
      "category": "leafy",
      "description": "Rau cải xanh",
      "image": null,
      "createdAt": "2026-01-11T08:00:00.000Z",
      "updatedAt": "2026-01-12T14:20:00.000Z"
    },
    "gardens": [
      {
        "gardenId": 1,
        "gardenName": "Vườn rau nhà tôi",
        "quantity": 200
      }
    ]
  }
]
```

**Error (404 Not Found)**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy shop",
  "error": "Not Found"
}
```

**Error (403 Forbidden)**
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền xem shop này",
  "error": "Forbidden"
}
```

### Ví dụ sử dụng (JavaScript/React)

```javascript
// services/shopService.js
const API_BASE_URL = 'http://localhost:3000';

export const getAvailableVegetables = async (shopId, token) => {
  const response = await fetch(`${API_BASE_URL}/shop/${shopId}/available-vegetables`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch available vegetables');
  }

  return response.json();
};

// Component usage
import { getAvailableVegetables } from '../services/shopService';
import { useAuth } from '../contexts/AuthContext';

function AddProductToShop({ shopId }) {
  const { token } = useAuth();
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVegetables = async () => {
      setLoading(true);
      try {
        const data = await getAvailableVegetables(shopId, token);
        setVegetables(data);
      } catch (error) {
        console.error('Error fetching vegetables:', error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchVegetables();
    }
  }, [shopId, token]);

  return (
    <div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ul>
          {vegetables.map((item) => (
            <li key={item.vegetable.id}>
              <h3>{item.vegetable.name}</h3>
              <p>Giá: {item.vegetable.price.toLocaleString('vi-VN')} VNĐ</p>
              <p>Có trong {item.gardens.length} vườn:</p>
              <ul>
                {item.gardens.map((garden) => (
                  <li key={garden.gardenId}>
                    {garden.gardenName} - Số lượng: {garden.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 2. Lấy danh sách sản phẩm trong shop (với filter và pagination)

Lấy danh sách các sản phẩm (rau) đã được thêm vào shop, hỗ trợ filter và pagination.

### Endpoint
```
GET /shop/:shopId/products
```

### Path Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `shopId` | number | Yes | ID của shop |

### Query Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `isAvailable` | boolean | No | Lọc theo trạng thái có sẵn (`true`/`false`) |
| `vegetableId` | number | No | Lọc theo ID rau |
| `gardenId` | number | No | Lọc theo ID vườn |
| `search` | string | No | Tìm kiếm theo tên rau hoặc tên vườn |
| `page` | number | No | Số trang (mặc định: 1) |
| `limit` | number | No | Số lượng mỗi trang (mặc định: 20) |

### Headers
```
Authorization: Bearer <access_token>
```

### Response

**Success (200 OK)**
```json
{
  "data": [
    {
      "id": 1,
      "shopId": 1,
      "vegetableId": 1,
      "gardenId": 1,
      "price": 35000,
      "stock": 100,
      "isAvailable": true,
      "createdAt": "2026-01-10T10:00:00.000Z",
      "updatedAt": "2026-01-12T15:30:00.000Z",
      "vegetable": {
        "id": 1,
        "name": "Rau muống",
        "imported": 100,
        "sold": 50,
        "price": 25000,
        "category": "leafy",
        "description": "Rau muống tươi ngon",
        "image": "http://localhost:3000/storage/view/vegetables/rau-muong.jpg",
        "createdAt": "2026-01-10T10:00:00.000Z",
        "updatedAt": "2026-01-12T15:30:00.000Z"
      },
      "garden": {
        "id": 1,
        "name": "Vườn rau nhà tôi",
        "ownerId": 12
      }
    },
    {
      "id": 2,
      "shopId": 1,
      "vegetableId": 2,
      "gardenId": 1,
      "price": 40000,
      "stock": 50,
      "isAvailable": true,
      "createdAt": "2026-01-11T08:00:00.000Z",
      "updatedAt": "2026-01-12T14:20:00.000Z",
      "vegetable": {
        "id": 2,
        "name": "Rau cải",
        "imported": 200,
        "sold": 100,
        "price": 30000,
        "category": "leafy",
        "description": "Rau cải xanh",
        "image": null,
        "createdAt": "2026-01-11T08:00:00.000Z",
        "updatedAt": "2026-01-12T14:20:00.000Z"
      },
      "garden": {
        "id": 1,
        "name": "Vườn rau nhà tôi",
        "ownerId": 12
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

**Error (404 Not Found)**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy shop",
  "error": "Not Found"
}
```

**Error (403 Forbidden)**
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền xem sản phẩm của shop này",
  "error": "Forbidden"
}
```

### Ví dụ sử dụng (JavaScript/React)

```javascript
// services/shopService.js
export const getShopProducts = async (shopId, filters = {}, pagination = {}, token) => {
  const queryParams = new URLSearchParams();
  
  if (filters.isAvailable !== undefined) {
    queryParams.append('isAvailable', filters.isAvailable);
  }
  if (filters.vegetableId) {
    queryParams.append('vegetableId', filters.vegetableId);
  }
  if (filters.gardenId) {
    queryParams.append('gardenId', filters.gardenId);
  }
  if (filters.search) {
    queryParams.append('search', filters.search);
  }
  if (pagination.page) {
    queryParams.append('page', pagination.page);
  }
  if (pagination.limit) {
    queryParams.append('limit', pagination.limit);
  }

  const url = `${API_BASE_URL}/shop/${shopId}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch shop products');
  }

  return response.json();
};

// Component usage
import { getShopProducts } from '../services/shopService';
import { useAuth } from '../contexts/AuthContext';

function ShopProductsList({ shopId }) {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getShopProducts(shopId, filters, { page, limit: 20 }, token);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchProducts(1);
    }
  }, [shopId, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      {/* Filter UI */}
      <div>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
        />
        <select
          onChange={(e) => handleFilterChange({ ...filters, isAvailable: e.target.value === 'all' ? undefined : e.target.value === 'true' })}
        >
          <option value="all">Tất cả</option>
          <option value="true">Có sẵn</option>
          <option value="false">Không có sẵn</option>
        </select>
      </div>

      {/* Products List */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <h3>{product.vegetable.name}</h3>
                <p>Vườn: {product.garden.name}</p>
                <p>Giá bán: {product.price.toLocaleString('vi-VN')} VNĐ</p>
                <p>Tồn kho: {product.stock}</p>
                <p>Trạng thái: {product.isAvailable ? 'Có sẵn' : 'Không có sẵn'}</p>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div>
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchProducts(pagination.page - 1)}
            >
              Trước
            </button>
            <span>
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchProducts(pagination.page + 1)}
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 3. Thêm sản phẩm vào shop

Thêm một loại rau từ garden vào shop.

### Endpoint
```
POST /shop/:shopId/products
```

### Path Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `shopId` | number | Yes | ID của shop |

### Request Body
```json
{
  "vegetableId": 1,
  "gardenId": 1,
  "price": 35000,
  "stock": 100,
  "isAvailable": true
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `vegetableId` | number | Yes | ID của loại rau |
| `gardenId` | number | Yes | ID của vườn |
| `price` | number | Yes | Giá bán tại shop (VNĐ), phải >= 0 |
| `stock` | number | Yes | Số lượng có sẵn, phải >= 0 |
| `isAvailable` | boolean | No | Có sẵn để bán không (mặc định: `true`) |

### Response

**Success (201 Created)**
```json
{
  "id": 1,
  "shopId": 1,
  "vegetableId": 1,
  "gardenId": 1,
  "price": 35000,
  "stock": 100,
  "isAvailable": true,
  "createdAt": "2026-01-12T18:00:00.000Z",
  "updatedAt": "2026-01-12T18:00:00.000Z",
  "vegetable": {
    "id": 1,
    "name": "Rau muống",
    "imported": 100,
    "sold": 50,
    "price": 25000,
    "category": "leafy",
    "description": "Rau muống tươi ngon",
    "image": "http://localhost:3000/storage/view/vegetables/rau-muong.jpg",
    "createdAt": "2026-01-10T10:00:00.000Z",
    "updatedAt": "2026-01-12T15:30:00.000Z"
  },
  "garden": {
    "id": 1,
    "name": "Vườn rau nhà tôi",
    "ownerId": 12,
    "deviceMac": null,
    "temperature": 25.5,
    "humidity": 70.0,
    "soil": 60.0,
    "timestamp": "2026-01-12T17:00:00.000Z",
    "pumpControl": "AUTO",
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-12T17:00:00.000Z"
  }
}
```

**Error (400 Bad Request)**
```json
{
  "statusCode": 400,
  "message": "Sản phẩm này đã tồn tại trong shop",
  "error": "Bad Request"
}
```

**Error (404 Not Found)**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy shop",
  "error": "Not Found"
}
```

**Error (403 Forbidden)**
```json
{
  "statusCode": 403,
  "message": "Vườn này không thuộc về bạn",
  "error": "Forbidden"
}
```

### Ví dụ sử dụng

```javascript
// services/shopService.js
export const addProductToShop = async (shopId, productData, token) => {
  const response = await fetch(`${API_BASE_URL}/shop/${shopId}/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add product to shop');
  }

  return response.json();
};

// Component usage
function AddProductForm({ shopId, onSuccess }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    vegetableId: '',
    gardenId: '',
    price: '',
    stock: '',
    isAvailable: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        vegetableId: parseInt(formData.vegetableId),
        gardenId: parseInt(formData.gardenId),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        isAvailable: formData.isAvailable,
      };
      
      const result = await addProductToShop(shopId, productData, token);
      alert('Thêm sản phẩm thành công!');
      onSuccess(result);
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Vegetable ID"
        value={formData.vegetableId}
        onChange={(e) => setFormData({ ...formData, vegetableId: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Garden ID"
        value={formData.gardenId}
        onChange={(e) => setFormData({ ...formData, gardenId: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Giá bán (VNĐ)"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
        min="0"
      />
      <input
        type="number"
        placeholder="Số lượng"
        value={formData.stock}
        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
        required
        min="0"
      />
      <label>
        <input
          type="checkbox"
          checked={formData.isAvailable}
          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
        />
        Có sẵn để bán
      </label>
      <button type="submit">Thêm sản phẩm</button>
    </form>
  );
}
```

---

## 4. Cập nhật sản phẩm trong shop

Cập nhật thông tin sản phẩm (giá, số lượng, trạng thái) trong shop.

### Endpoint
```
PATCH /shop/:shopId/products/:productId
```

### Path Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `shopId` | number | Yes | ID của shop |
| `productId` | number | Yes | ID của sản phẩm (ShopProduct) |

### Request Body
Tất cả các field đều optional, chỉ gửi các field cần cập nhật:
```json
{
  "price": 40000,
  "stock": 150,
  "isAvailable": false
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `price` | number | No | Giá bán tại shop (VNĐ), phải >= 0 |
| `stock` | number | No | Số lượng có sẵn, phải >= 0 |
| `isAvailable` | boolean | No | Có sẵn để bán không |

### Response

**Success (200 OK)**
```json
{
  "id": 1,
  "shopId": 1,
  "vegetableId": 1,
  "gardenId": 1,
  "price": 40000,
  "stock": 150,
  "isAvailable": false,
  "createdAt": "2026-01-12T18:00:00.000Z",
  "updatedAt": "2026-01-12T19:00:00.000Z",
  "vegetable": {
    "id": 1,
    "name": "Rau muống",
    "imported": 100,
    "sold": 50,
    "price": 25000,
    "category": "leafy",
    "description": "Rau muống tươi ngon",
    "image": "http://localhost:3000/storage/view/vegetables/rau-muong.jpg",
    "createdAt": "2026-01-10T10:00:00.000Z",
    "updatedAt": "2026-01-12T15:30:00.000Z"
  },
  "garden": {
    "id": 1,
    "name": "Vườn rau nhà tôi",
    "ownerId": 12,
    "deviceMac": null,
    "temperature": 25.5,
    "humidity": 70.0,
    "soil": 60.0,
    "timestamp": "2026-01-12T17:00:00.000Z",
    "pumpControl": "AUTO",
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-12T17:00:00.000Z"
  }
}
```

**Error (404 Not Found)**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy sản phẩm",
  "error": "Not Found"
}
```

**Error (403 Forbidden)**
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền cập nhật sản phẩm này",
  "error": "Forbidden"
}
```

### Ví dụ sử dụng

```javascript
// services/shopService.js
export const updateShopProduct = async (shopId, productId, updateData, token) => {
  const response = await fetch(`${API_BASE_URL}/shop/${shopId}/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }

  return response.json();
};

// Component usage
function EditProductForm({ shopId, product, onSuccess }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    price: product.price,
    stock: product.stock,
    isAvailable: product.isAvailable,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateShopProduct(shopId, product.id, formData, token);
      alert('Cập nhật sản phẩm thành công!');
      onSuccess(result);
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Giá bán (VNĐ)"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
        min="0"
      />
      <input
        type="number"
        placeholder="Số lượng"
        value={formData.stock}
        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
        required
        min="0"
      />
      <label>
        <input
          type="checkbox"
          checked={formData.isAvailable}
          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
        />
        Có sẵn để bán
      </label>
      <button type="submit">Cập nhật</button>
    </form>
  );
}
```

---

## 5. Xóa sản phẩm khỏi shop

Xóa một sản phẩm khỏi shop.

### Endpoint
```
DELETE /shop/:shopId/products/:productId
```

### Path Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `shopId` | number | Yes | ID của shop |
| `productId` | number | Yes | ID của sản phẩm (ShopProduct) |

### Response

**Success (200 OK)**
```json
{
  "id": 1,
  "shopId": 1,
  "vegetableId": 1,
  "gardenId": 1,
  "price": 35000,
  "stock": 100,
  "isAvailable": true,
  "createdAt": "2026-01-12T18:00:00.000Z",
  "updatedAt": "2026-01-12T18:00:00.000Z"
}
```

**Error (404 Not Found)**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy sản phẩm",
  "error": "Not Found"
}
```

**Error (403 Forbidden)**
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền xóa sản phẩm này",
  "error": "Forbidden"
}
```

### Ví dụ sử dụng

```javascript
// services/shopService.js
export const deleteShopProduct = async (shopId, productId, token) => {
  const response = await fetch(`${API_BASE_URL}/shop/${shopId}/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }

  return response.json();
};

// Component usage
function ProductItem({ shopId, product, onDelete }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteShopProduct(shopId, product.id, token);
      alert('Xóa sản phẩm thành công!');
      onDelete(product.id);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>{product.vegetable.name}</h3>
      <p>Giá: {product.price.toLocaleString('vi-VN')} VNĐ</p>
      <p>Tồn kho: {product.stock}</p>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Đang xóa...' : 'Xóa'}
      </button>
    </div>
  );
}
```

---

## 6. Lấy danh sách shop của tôi

Lấy danh sách tất cả shop của user hiện tại.

### Endpoint
```
GET /shop/my-shops
```

### Response

**Success (200 OK)**
```json
[
  {
    "id": 1,
    "name": "Cửa hàng rau sạch của tôi",
    "description": "Chuyên bán rau sạch từ vườn nhà",
    "ownerId": 12,
    "isActive": true,
    "createdAt": "2026-01-10T10:00:00.000Z",
    "updatedAt": "2026-01-12T15:30:00.000Z",
    "products": [
      {
        "id": 1,
        "shopId": 1,
        "vegetableId": 1,
        "gardenId": 1,
        "price": 35000,
        "stock": 100,
        "isAvailable": true,
        "vegetable": {
          "id": 1,
          "name": "Rau muống",
          "price": 25000,
          "category": "leafy"
        },
        "garden": {
          "id": 1,
          "name": "Vườn rau nhà tôi"
        }
      }
    ],
    "_count": {
      "products": 5,
      "orders": 10
    }
  }
]
```

---

## Tổng hợp các Endpoints

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| GET | `/shop/:shopId/available-vegetables` | Lấy danh sách rau có thể thêm vào shop | USER, ADMIN |
| GET | `/shop/:shopId/products` | Lấy danh sách sản phẩm trong shop (có filter/pagination) | USER, ADMIN |
| POST | `/shop/:shopId/products` | Thêm sản phẩm vào shop | USER, ADMIN |
| PATCH | `/shop/:shopId/products/:productId` | Cập nhật sản phẩm trong shop | USER, ADMIN |
| DELETE | `/shop/:shopId/products/:productId` | Xóa sản phẩm khỏi shop | USER, ADMIN |
| GET | `/shop/my-shops` | Lấy danh sách shop của tôi | USER, ADMIN |

---

## Lưu ý quan trọng

1. **Authentication**: Tất cả endpoints yêu cầu JWT token trong header `Authorization: Bearer <token>`

2. **Authorization**: 
   - USER chỉ có thể quản lý shop và sản phẩm của chính mình
   - ADMIN có thể quản lý tất cả shop và sản phẩm

3. **Validation**:
   - `price` và `stock` phải >= 0
   - `vegetableId` và `gardenId` phải tồn tại trong database
   - `gardenId` phải thuộc về user (ownerId)

4. **Unique Constraint**: 
   - Một combination `(shopId, vegetableId, gardenId)` chỉ có thể tồn tại một lần trong shop
   - Nếu thêm trùng, sẽ nhận lỗi 400 "Sản phẩm này đã tồn tại trong shop"

5. **Image URLs**: 
   - Các URL hình ảnh từ backend sử dụng format: `http://localhost:3000/storage/view/...`
   - Xem thêm tài liệu `STORAGE_API.md` để biết cách xử lý images

6. **Error Handling**: 
   - Luôn kiểm tra `response.ok` trước khi parse JSON
   - Xử lý các error codes: 400 (Bad Request), 403 (Forbidden), 404 (Not Found)

---

## Ví dụ workflow hoàn chỉnh

```javascript
// 1. Lấy danh sách shop của user
const shops = await getMyShops(token);

// 2. Chọn một shop
const shopId = shops[0].id;

// 3. Lấy danh sách rau có thể thêm vào shop
const availableVegetables = await getAvailableVegetables(shopId, token);

// 4. Thêm một rau vào shop
const newProduct = await addProductToShop(shopId, {
  vegetableId: availableVegetables[0].vegetable.id,
  gardenId: availableVegetables[0].gardens[0].gardenId,
  price: 35000,
  stock: 100,
  isAvailable: true
}, token);

// 5. Lấy danh sách sản phẩm trong shop
const products = await getShopProducts(shopId, {}, { page: 1, limit: 20 }, token);

// 6. Cập nhật sản phẩm
const updated = await updateShopProduct(shopId, products.data[0].id, {
  price: 40000,
  stock: 150
}, token);

// 7. Xóa sản phẩm (nếu cần)
await deleteShopProduct(shopId, products.data[0].id, token);
```

---

**Tài liệu này được cập nhật lần cuối: 2026-01-12**
