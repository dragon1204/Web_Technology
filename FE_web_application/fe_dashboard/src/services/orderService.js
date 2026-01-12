import api from './api';

// Helper function để xử lý response từ backend
const extractData = (response) => {
  return response.data?.data || response.data;
};

const orderService = {
  // Shipping Address Management
  getShippingAddresses: async () => {
    const response = await api.get('/order/shipping-address');
    const data = extractData(response);
    return Array.isArray(data) ? data : [];
  },

  createShippingAddress: async (data) => {
    const response = await api.post('/order/shipping-address', data);
    return extractData(response);
  },

  updateShippingAddress: async (addressId, data) => {
    const response = await api.put(`/order/shipping-address/${addressId}`, data);
    return extractData(response);
  },

  deleteShippingAddress: async (addressId) => {
    const response = await api.delete(`/order/shipping-address/${addressId}`);
    return extractData(response);
  },

  // Order Management
  checkout: async (data) => {
    const response = await api.post('/order/checkout', data);
    return extractData(response);
  },

  getMyOrders: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/order/my-orders', { params });
    const data = extractData(response);
    return Array.isArray(data) ? data : [];
  },

  getOrderDetails: async (orderId) => {
    const response = await api.get(`/order/${orderId}`);
    return extractData(response);
  },

  // For shop owners
  getShopOrders: async (shopId, status = null) => {
    const params = status ? { status } : {};
    const response = await api.get(`/order/shop/${shopId}`, { params });
    const data = extractData(response);
    return Array.isArray(data) ? data : [];
  },

  updateOrderStatus: async (shopId, orderId, status) => {
    const response = await api.patch(`/order/${shopId}/orders/${orderId}/status`, { status });
    return extractData(response);
  },
};

export default orderService;
