import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../../services/cartService';
import storageService from '../../services/storageService';
import '../../styles/ShoppingCart.css';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      
      // Load images for cart items
      if (data.items) {
        const itemsWithImages = await Promise.all(
          data.items.map(async (item) => {
            if (item.shopProduct?.vegetable?.image) {
              try {
                const url = await storageService.getImageUrl(item.shopProduct.vegetable.image);
                return {
                  ...item,
                  shopProduct: {
                    ...item.shopProduct,
                    vegetable: {
                      ...item.shopProduct.vegetable,
                      imageUrl: url,
                    },
                  },
                };
              } catch (err) {
                return item;
              }
            }
            return item;
          })
        );
        data.items = itemsWithImages;
      }
      
      setCart(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại!');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await cartService.updateCartItem(itemId, newQuantity);
      await fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật số lượng!');
      console.error('Error updating cart item:', err);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await cartService.removeCartItem(itemId);
      await fetchCart();
    } catch (err) {
      alert('Không thể xóa sản phẩm!');
      console.error('Error removing cart item:', err);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
    
    try {
      await cartService.clearCart();
      await fetchCart();
    } catch (err) {
      alert('Không thể xóa giỏ hàng!');
      console.error('Error clearing cart:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const groupItemsByShop = () => {
    if (!cart || !cart.items) return {};
    
    const grouped = {};
    cart.items.forEach(item => {
      const shopId = item.shopProduct.shop.id;
      if (!grouped[shopId]) {
        grouped[shopId] = {
          shop: item.shopProduct.shop,
          items: [],
          subtotal: 0,
        };
      }
      grouped[shopId].items.push(item);
      grouped[shopId].subtotal += item.quantity * item.shopProduct.price;
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchCart} className="retry-button">Thử lại</button>
        </div>
      </div>
    );
  }

  const groupedItems = groupItemsByShop();
  const shopIds = Object.keys(groupedItems);

  return (
    <div className="cart-container">
      <div className="cart-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <i className="fas fa-arrow-left"></i>
          Quay lại
        </button>
        <h1>
          <i className="fas fa-shopping-cart"></i>
          Giỏ Hàng Của Bạn
        </h1>
        {cart && cart.itemCount > 0 && (
          <button onClick={handleClearCart} className="clear-cart-btn">
            <i className="fas fa-trash"></i>
            Xóa tất cả
          </button>
        )}
      </div>

      {!cart || cart.itemCount === 0 ? (
        <div className="empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
          <button onClick={() => navigate('/customer/shops')} className="continue-shopping-btn">
            <i className="fas fa-store"></i>
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-section">
            {shopIds.map(shopId => {
              const group = groupedItems[shopId];
              return (
                <div key={shopId} className="shop-cart-group">
                  <div className="shop-cart-header">
                    <i className="fas fa-store"></i>
                    <h3>{group.shop.name}</h3>
                  </div>

                  <div className="cart-items">
                    {group.items.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-image">
                          {item.shopProduct?.vegetable?.imageUrl ? (
                            <img 
                              src={item.shopProduct.vegetable.imageUrl} 
                              alt={item.shopProduct.vegetable.name}
                              onError={(e) => {
                                console.error('Image load error:', item.shopProduct.vegetable.imageUrl);
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="cart-item-image-placeholder">
                              <i className="fas fa-leaf"></i>
                            </div>
                          )}
                        </div>

                        <div className="cart-item-details">
                          <h4>{item.shopProduct.vegetable.name}</h4>
                          <p className="cart-item-garden">
                            <i className="fas fa-seedling"></i>
                            {item.shopProduct.garden.name}
                          </p>
                          <p className="cart-item-price">
                            {formatPrice(item.shopProduct.price)}
                          </p>
                          <p className="cart-item-stock">
                            Còn lại: {item.shopProduct.stock}
                          </p>
                        </div>

                        <div className="cart-item-actions">
                          <div className="quantity-control">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                              className="quantity-btn"
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <span className="quantity-display">
                              {updatingItems.has(item.id) ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.shopProduct.stock || updatingItems.has(item.id)}
                              className="quantity-btn"
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>

                          <div className="cart-item-subtotal">
                            {formatPrice(item.quantity * item.shopProduct.price)}
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="remove-item-btn"
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="shop-cart-footer">
                    <div className="shop-subtotal">
                      <span>Tổng tiền shop:</span>
                      <strong>{formatPrice(group.subtotal)}</strong>
                    </div>
                    <button
                      onClick={() => navigate(`/customer/checkout/${shopId}`)}
                      className="checkout-shop-btn"
                    >
                      Thanh toán shop này
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>
                <i className="fas fa-receipt"></i>
                Tóm Tắt Đơn Hàng
              </h3>
              
              <div className="summary-row">
                <span>Số lượng sản phẩm:</span>
                <strong>{cart.itemCount}</strong>
              </div>
              
              <div className="summary-row total">
                <span>Tổng tiền hàng:</span>
                <strong className="total-price">{formatPrice(cart.subtotal)}</strong>
              </div>

              <div className="summary-note">
                <i className="fas fa-info-circle"></i>
                <p>Bạn phải thanh toán riêng cho từng shop</p>
              </div>

              <button
                onClick={() => navigate('/customer/products')}
                className="continue-shopping-link"
              >
                <i className="fas fa-shopping-basket"></i>
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
