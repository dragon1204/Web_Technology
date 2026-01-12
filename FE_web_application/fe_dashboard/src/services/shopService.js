import api from './api';

// Helper function để xử lý response từ backend
const extractData = (response) => {
  // Backend có thể trả về { HttpCode, success, data: [...] } hoặc trực tiếp là data
  return response.data?.data || response.data;
};

const shopService = {
  // Get all active shops
  getActiveShops: async () => {
    const response = await api.get('/shop/active');
    const data = extractData(response);
    // Đảm bảo luôn trả về array
    return Array.isArray(data) ? data : [];
  },

  // Get shop details
  getShopDetails: async (shopId) => {
    const response = await api.get(`/shop/${shopId}`);
    return extractData(response);
  },

  // Get my shops (for shop owners)
  getMyShops: async () => {
    const response = await api.get('/shop/my-shops');
    const data = extractData(response);
    return Array.isArray(data) ? data : [];
  },

  // Create new shop
  createShop: async (data) => {
    const response = await api.post('/shop', data);
    return extractData(response);
  },

  // Add product to shop
  addProductToShop: async (shopId, productData) => {
    const response = await api.post(`/shop/${shopId}/products`, productData);
    return extractData(response);
  },

  // Update shop product
  updateShopProduct: async (shopId, productId, data) => {
    const response = await api.patch(`/shop/${shopId}/products/${productId}`, data);
    return extractData(response);
  },

  // Delete shop product
  deleteShopProduct: async (shopId, productId) => {
    const response = await api.delete(`/shop/${shopId}/products/${productId}`);
    return extractData(response);
  },
};

export default shopService;
