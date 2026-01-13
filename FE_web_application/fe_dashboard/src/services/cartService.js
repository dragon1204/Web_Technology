import api from './api';

// Helper function để xử lý response từ backend
const extractData = (response) => {
  return response.data?.data || response.data;
};

const cartService = {
  // Get cart
  getCart: async () => {
    const response = await api.get('/cart');
    return extractData(response);
  },

  // Add item to cart
  addToCart: async (data) => {
    const response = await api.post('/cart/items', data);
    return extractData(response);
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    return extractData(response);
  },

  // Remove item from cart
  removeCartItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return extractData(response);
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return extractData(response);
  },
};

export default cartService;
