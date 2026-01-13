import api from './api';

// Helper function để xử lý response từ backend
const extractData = (response) => {
  return response.data?.data || response.data;
};

const productService = {
  // Search and filter products
  searchProducts: async (params = {}) => {
    const response = await api.get('/product', { params });
    const data = extractData(response);
    // Có thể trả về object với pagination hoặc array
    if (Array.isArray(data)) {
      return { products: data, total: data.length, page: 1, totalPages: 1 };
    }
    return data;
  },

  // Get product details
  getProductDetails: async (productId) => {
    const response = await api.get(`/product/${productId}`);
    return extractData(response);
  },

  // Get products by shop
  getProductsByShop: async (shopId) => {
    const response = await api.get(`/product/shop/${shopId}`);
    const data = extractData(response);
    return Array.isArray(data) ? data : [];
  },
};

export default productService;
