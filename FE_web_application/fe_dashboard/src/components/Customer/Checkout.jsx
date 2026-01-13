import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import cartService from '../../services/cartService';
import storageService from '../../services/storageService';
import PaymentCheckout from '../Payment/PaymentCheckout';
import '../../styles/Checkout.css';

const Checkout = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null); // Store created order for payment

  // New address form
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchData();
  }, [shopId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cartData, addressesData] = await Promise.all([
        cartService.getCart(),
        orderService.getShippingAddresses(),
      ]);

      // Load images for cart items
      if (cartData.items) {
        const itemsWithImages = await Promise.all(
          cartData.items.map(async (item) => {
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
        cartData.items = itemsWithImages;
      }

      setCart(cartData);
      setAddresses(addressesData);

      // Auto-select default address
      const defaultAddr = addressesData.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      alert('Không thể tải dữ liệu!');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      await orderService.createShippingAddress(newAddress);
      await fetchData();
      setShowAddressForm(false);
      setNewAddress({
        fullName: '',
        phone: '',
        address: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false,
      });
      alert('Đã thêm địa chỉ mới!');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thêm địa chỉ!');
      console.error('Error creating address:', err);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert('Vui lòng chọn địa chỉ giao hàng!');
      return;
    }

    if (!cart || cart.itemCount === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    // Check if cart has items from this shop
    const shopItems = cart.items.filter(item => item.shopProduct.shop.id === parseInt(shopId));
    if (shopItems.length === 0) {
      alert('Không có sản phẩm nào từ shop này trong giỏ hàng!');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Creating order with data:', {
        shopId: parseInt(shopId),
        shippingAddressId: selectedAddressId,
        notes,
      });
      
      const orderResponse = await orderService.checkout({
        shopId: parseInt(shopId),
        shippingAddressId: selectedAddressId,
        notes,
      });

      console.log('Order response:', orderResponse);

      // Extract order data (handle different response formats)
      const order = orderResponse?.data || orderResponse;
      
      console.log('Extracted order:', order);
      
      if (!order || !order.id) {
        console.error('Invalid order response:', orderResponse);
        throw new Error('Không nhận được thông tin đơn hàng từ server');
      }

      // Store order for payment instead of redirecting
      const orderData = {
        id: order.id,
        orderNumber: order.orderNumber || `ORDER-${order.id}`,
        total: order.total || total,
      };
      
      console.log('Setting created order:', orderData);
      setCreatedOrder(orderData);
      
      // Clear cart after successful order
      try {
        await cartService.clearCart();
      } catch (cartErr) {
        console.warn('Could not clear cart:', cartErr);
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      alert(err.response?.data?.message || err.message || 'Không thể đặt hàng!');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateShopTotal = () => {
    if (!cart || !cart.items) return 0;
    
    const shopItems = cart.items.filter(item => item.shopProduct.shop.id === parseInt(shopId));
    return shopItems.reduce((sum, item) => sum + (item.quantity * item.shopProduct.price), 0);
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  const shopItems = cart?.items?.filter(item => item.shopProduct.shop.id === parseInt(shopId)) || [];
  const subtotal = calculateShopTotal();
  const estimatedShipping = subtotal >= 200000 ? 0 : subtotal >= 100000 ? 10000 : 20000;
  const total = subtotal + estimatedShipping;

  // If order is created, show payment checkout
  if (createdOrder) {
    return (
      <PaymentCheckout
        orderId={createdOrder.id}
        orderNumber={createdOrder.orderNumber}
        totalAmount={createdOrder.total}
        onPaymentSuccess={() => {
          navigate(`/customer/orders/${createdOrder.id}`);
        }}
        onCancel={() => {
          setCreatedOrder(null);
        }}
      />
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={() => navigate('/customer/cart')} className="back-button">
          <i className="fas fa-arrow-left"></i>
          Quay lại giỏ hàng
        </button>
        <h1>
          <i className="fas fa-credit-card"></i>
          Thanh Toán
        </h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {/* Shipping Address Section */}
          <div className="checkout-section">
            <h2>
              <i className="fas fa-map-marker-alt"></i>
              Địa Chỉ Giao Hàng
            </h2>

            {addresses.length === 0 ? (
              <div className="no-address">
                <p>Bạn chưa có địa chỉ giao hàng nào</p>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <div className="address-radio">
                      <input
                        type="radio"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                    </div>
                    <div className="address-info">
                      <div className="address-header">
                        <strong>{addr.fullName}</strong>
                        {addr.isDefault && <span className="default-badge">Mặc định</span>}
                      </div>
                      <p className="address-phone">{addr.phone}</p>
                      <p className="address-detail">
                        {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showAddressForm ? (
              <button
                onClick={() => setShowAddressForm(true)}
                className="add-address-btn"
              >
                <i className="fas fa-plus"></i>
                Thêm địa chỉ mới
              </button>
            ) : (
              <form onSubmit={handleCreateAddress} className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ tên *</label>
                    <input
                      type="text"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa chỉ *</label>
                  <input
                    type="text"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                    placeholder="Số nhà, tên đường"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phường/Xã *</label>
                    <input
                      type="text"
                      value={newAddress.ward}
                      onChange={(e) => setNewAddress({...newAddress, ward: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Quận/Huyện *</label>
                    <input
                      type="text"
                      value={newAddress.district}
                      onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tỉnh/Thành phố *</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                  />
                  <label htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    <i className="fas fa-save"></i>
                    Lưu địa chỉ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="cancel-btn"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Items */}
          <div className="checkout-section">
            <h2>
              <i className="fas fa-box"></i>
              Sản Phẩm ({shopItems.length})
            </h2>
            <div className="checkout-items">
              {shopItems.map(item => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item-image">
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
                      <div className="checkout-item-image-placeholder">
                        <i className="fas fa-leaf"></i>
                      </div>
                    )}
                  </div>
                  <div className="checkout-item-details">
                    <h4>{item.shopProduct.vegetable.name}</h4>
                    <p>{item.shopProduct.garden.name}</p>
                    <p className="item-quantity">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="checkout-item-price">
                    {formatPrice(item.quantity * item.shopProduct.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="checkout-section">
            <h2>
              <i className="fas fa-sticky-note"></i>
              Ghi Chú
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú cho người bán (ví dụ: giao hàng vào buổi sáng)"
              rows="4"
              className="notes-input"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-sidebar">
          <div className="summary-card sticky">
            <h3>
              <i className="fas fa-receipt"></i>
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="summary-row">
              <span>Tổng tiền hàng:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{formatPrice(estimatedShipping)}</span>
            </div>

            {estimatedShipping === 0 && (
              <div className="free-shipping-notice">
                <i className="fas fa-truck"></i>
                Miễn phí vận chuyển
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Tổng thanh toán:</span>
              <strong className="total-price">{formatPrice(total)}</strong>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting || !selectedAddressId || shopItems.length === 0}
              className="checkout-btn"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i>
                  Đặt Hàng
                </>
              )}
            </button>

            <div className="payment-note">
              <i className="fas fa-info-circle"></i>
              <p>Thanh toán khi nhận hàng (COD)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
