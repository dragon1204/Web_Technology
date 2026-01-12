import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import storageService from '../../services/storageService';
import '../../styles/OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderDetails(orderId);
      
      // Load images for order items
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
      
      setOrder(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải chi tiết đơn hàng!');
      console.error('Error fetching order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xác nhận', icon: 'clock', color: 'warning' },
      CONFIRMED: { label: 'Đã xác nhận', icon: 'check-circle', color: 'info' },
      PROCESSING: { label: 'Đang xử lý', icon: 'cog', color: 'info' },
      SHIPPED: { label: 'Đang giao hàng', icon: 'truck', color: 'primary' },
      DELIVERED: { label: 'Đã giao hàng', icon: 'check-double', color: 'success' },
      CANCELLED: { label: 'Đã hủy', icon: 'times-circle', color: 'danger' },
    };
    return statusMap[status] || { label: status, icon: 'question', color: 'secondary' };
  };

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error || 'Không tìm thấy đơn hàng'}</p>
          <button onClick={() => navigate('/customer/orders')} className="back-button">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <button onClick={() => navigate('/customer/orders')} className="back-button">
          <i className="fas fa-arrow-left"></i>
          Quay lại
        </button>
        <h1>Chi Tiết Đơn Hàng</h1>
      </div>

      <div className="order-detail-content">
        {/* Order Info Card */}
        <div className="order-info-card">
          <div className="order-info-header">
            <div>
              <h2>#{order.orderNumber}</h2>
              <p className="order-date">
                <i className="fas fa-calendar-alt"></i>
                Đặt hàng lúc: {formatDate(order.createdAt)}
              </p>
            </div>
            <span className={`order-status-badge ${statusInfo.color}`}>
              <i className={`fas fa-${statusInfo.icon}`}></i>
              {statusInfo.label}
            </span>
          </div>

          {/* Order Timeline */}
          <div className="order-timeline">
            <div className={`timeline-item ${['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="timeline-content">
                <strong>Đơn hàng đã đặt</strong>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>

            <div className={`timeline-item ${['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="timeline-content">
                <strong>Đã xác nhận</strong>
              </div>
            </div>

            <div className={`timeline-item ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-icon">
                <i className="fas fa-cog"></i>
              </div>
              <div className="timeline-content">
                <strong>Đang xử lý</strong>
              </div>
            </div>

            <div className={`timeline-item ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-icon">
                <i className="fas fa-truck"></i>
              </div>
              <div className="timeline-content">
                <strong>Đang giao hàng</strong>
              </div>
            </div>

            <div className={`timeline-item ${order.status === 'DELIVERED' ? 'completed' : ''}`}>
              <div className="timeline-icon">
                <i className="fas fa-check-double"></i>
              </div>
              <div className="timeline-content">
                <strong>Đã giao hàng</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Info */}
        <div className="detail-section">
          <h3>
            <i className="fas fa-store"></i>
            Thông Tin Cửa Hàng
          </h3>
          <div className="shop-info-box">
            <div className="shop-icon">
              <i className="fas fa-store"></i>
            </div>
            <div className="shop-details">
              <strong>{order.shop.name}</strong>
              <p>{order.shop.description}</p>
              {order.shop.owner && (
                <p className="shop-owner">
                  <i className="fas fa-user"></i>
                  Chủ shop: {order.shop.owner.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="detail-section">
          <h3>
            <i className="fas fa-map-marker-alt"></i>
            Địa Chỉ Giao Hàng
          </h3>
          <div className="address-box">
            <p className="address-name">
              <strong>{order.shippingAddress.fullName}</strong>
              <span className="address-phone">{order.shippingAddress.phone}</span>
            </p>
            <p className="address-detail">
              {order.shippingAddress.address}, {order.shippingAddress.ward}, 
              {order.shippingAddress.district}, {order.shippingAddress.city}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="detail-section">
          <h3>
            <i className="fas fa-box"></i>
            Sản Phẩm ({order.items.length})
          </h3>
          <div className="order-items-list">
            {order.items.map(item => (
              <div key={item.id} className="order-item-detail">
                <div className="order-item-image">
                  {item.shopProduct?.vegetable?.imageUrl ? (
                    <img 
                      src={item.shopProduct.vegetable.imageUrl} 
                      alt={item.shopProduct.vegetable.name} 
                    />
                  ) : (
                    <div className="order-item-image-placeholder">
                      <i className="fas fa-leaf"></i>
                    </div>
                  )}
                </div>
                <div className="order-item-info">
                  <h4>{item.shopProduct?.vegetable?.name || 'Sản phẩm'}</h4>
                  <p className="item-garden">
                    <i className="fas fa-seedling"></i>
                    {item.shopProduct?.garden?.name}
                  </p>
                  <p className="item-meta">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <div className="order-item-subtotal">
                  {formatPrice(item.subtotal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="detail-section">
            <h3>
              <i className="fas fa-sticky-note"></i>
              Ghi Chú
            </h3>
            <div className="notes-box">
              <p>{order.notes}</p>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="detail-section payment-summary">
          <h3>
            <i className="fas fa-receipt"></i>
            Thông Tin Thanh Toán
          </h3>
          <div className="payment-details">
            <div className="payment-row">
              <span>Tổng tiền hàng:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="payment-row">
              <span>Phí vận chuyển:</span>
              <span>{formatPrice(order.shippingFee)}</span>
            </div>
            <div className="payment-divider"></div>
            <div className="payment-row total">
              <strong>Tổng thanh toán:</strong>
              <strong className="total-amount">{formatPrice(order.total)}</strong>
            </div>
            <div className="payment-method">
              <i className="fas fa-money-bill-wave"></i>
              Thanh toán khi nhận hàng (COD)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
