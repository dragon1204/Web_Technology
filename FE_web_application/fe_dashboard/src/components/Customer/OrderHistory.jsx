import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import storageService from '../../services/storageService';
import '../../styles/OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders(filterStatus || null);
      
      // Load images for order items
      const ordersWithImages = await Promise.all(
        data.map(async (order) => {
          if (order.items) {
            const itemsWithImages = await Promise.all(
              order.items.map(async (item) => {
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
            return { ...order, items: itemsWithImages };
          }
          return order;
        })
      );
      
      setOrders(ordersWithImages);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng!');
      console.error('Error fetching orders:', err);
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
      <div className="order-history-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-button">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1>
          <i className="fas fa-history"></i>
          Lịch Sử Đơn Hàng
        </h1>
        <p className="subtitle">Quản lý và theo dõi đơn hàng của bạn</p>
      </div>

      {/* Filter */}
      <div className="order-filter">
        <button
          className={`filter-btn ${filterStatus === '' ? 'active' : ''}`}
          onClick={() => setFilterStatus('')}
        >
          Tất cả
        </button>
        <button
          className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
          onClick={() => setFilterStatus('PENDING')}
        >
          <i className="fas fa-clock"></i>
          Chờ xác nhận
        </button>
        <button
          className={`filter-btn ${filterStatus === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('CONFIRMED')}
        >
          <i className="fas fa-check-circle"></i>
          Đã xác nhận
        </button>
        <button
          className={`filter-btn ${filterStatus === 'SHIPPED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('SHIPPED')}
        >
          <i className="fas fa-truck"></i>
          Đang giao
        </button>
        <button
          className={`filter-btn ${filterStatus === 'DELIVERED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('DELIVERED')}
        >
          <i className="fas fa-check-double"></i>
          Đã giao
        </button>
        <button
          className={`filter-btn ${filterStatus === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('CANCELLED')}
        >
          <i className="fas fa-times-circle"></i>
          Đã hủy
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="no-orders">
          <i className="fas fa-clipboard-list"></i>
          <h2>Không có đơn hàng nào</h2>
          <p>Bạn chưa có đơn hàng nào {filterStatus && `ở trạng thái "${getStatusInfo(filterStatus).label}"`}</p>
          <button onClick={() => navigate('/customer/shops')} className="start-shopping-btn">
            <i className="fas fa-shopping-cart"></i>
            Bắt đầu mua sắm
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-number">
                    <i className="fas fa-receipt"></i>
                    <span>#{order.orderNumber}</span>
                  </div>
                  <span className={`order-status ${statusInfo.color}`}>
                    <i className={`fas fa-${statusInfo.icon}`}></i>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-shop">
                    <i className="fas fa-store"></i>
                    <strong>{order.shop.name}</strong>
                  </div>

                  <div className="order-date">
                    <i className="fas fa-calendar-alt"></i>
                    {formatDate(order.createdAt)}
                  </div>

                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="order-item-preview">
                        <div className="item-preview-image">
                          {item.shopProduct?.vegetable?.imageUrl ? (
                            <img 
                              src={item.shopProduct.vegetable.imageUrl} 
                              alt={item.shopProduct.vegetable.name} 
                            />
                          ) : (
                            <div className="item-preview-placeholder">
                              <i className="fas fa-leaf"></i>
                            </div>
                          )}
                        </div>
                        <div className="item-preview-info">
                          <span className="item-name">
                            {item.shopProduct?.vegetable?.name || 'Sản phẩm'}
                          </span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="more-items">
                        +{order.items.length - 3} sản phẩm khác
                      </div>
                    )}
                  </div>

                  <div className="order-address">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <strong>{order.shippingAddress.fullName}</strong>
                      <span> - {order.shippingAddress.phone}</span>
                      <p>
                        {order.shippingAddress.address}, {order.shippingAddress.ward}, 
                        {order.shippingAddress.district}, {order.shippingAddress.city}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="order-notes">
                      <i className="fas fa-sticky-note"></i>
                      <span>{order.notes}</span>
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span>Tổng tiền:</span>
                    <strong className="total-price">{formatPrice(order.total)}</strong>
                  </div>
                  <button
                    onClick={() => navigate(`/customer/orders/${order.id}`)}
                    className="view-detail-btn"
                  >
                    Xem chi tiết
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
