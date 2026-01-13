import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import shopService from '../../services/shopService';
import orderService from '../../services/orderService';
import storageService from '../../services/storageService';
import toast from 'react-hot-toast';
import '../../styles/ShopOrderManagement.css';

const ShopOrderManagement = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    fetchMyShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      fetchShopOrders();
    }
  }, [selectedShop, filterStatus]);

  const fetchMyShops = async () => {
    try {
      setLoading(true);
      const data = await shopService.getMyShops();
      setShops(data || []);
      if (data && data.length > 0) {
        setSelectedShop(data[0]);
      } else {
        toast.error("Bạn chưa có shop nào. Vui lòng tạo shop trước.");
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast.error(error.message || "Không thể tải danh sách shop");
      setError('Không thể tải danh sách shop');
    } finally {
      setLoading(false);
    }
  };

  const fetchShopOrders = async () => {
    if (!selectedShop) return;

    try {
      setLoading(true);
      const data = await orderService.getShopOrders(
        selectedShop.id,
        filterStatus || null
      );

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
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!selectedShop) return;

    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));

    try {
      await orderService.updateOrderStatus(selectedShop.id, orderId, newStatus);
      toast.success(`Đã cập nhật trạng thái đơn hàng thành ${getStatusInfo(newStatus).label}`);
      
      // Refresh orders list
      await fetchShopOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
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

  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };
    return statusFlow[currentStatus] || [];
  };

  if (loading && shops.length === 0) {
    return (
      <div className="shop-order-management-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error && shops.length === 0) {
    return (
      <div className="shop-order-management-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchMyShops} className="retry-button">Thử lại</button>
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="shop-order-management-container">
        <div className="no-shops">
          <i className="fas fa-store-slash"></i>
          <h2>Bạn chưa có shop nào</h2>
          <p>Vui lòng tạo shop trước khi quản lý đơn hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-order-management-container">
      <div className="shop-order-header">
        <h1>
          <i className="fas fa-clipboard-list"></i>
          Quản Lý Đơn Hàng
        </h1>
        <p className="subtitle">Quản lý và cập nhật trạng thái đơn hàng của shop</p>
      </div>

      {/* Shop Selector */}
      <div className="shop-selector">
        <label>
          <i className="fas fa-store"></i>
          Chọn Shop:
        </label>
        <select
          value={selectedShop?.id || ''}
          onChange={(e) => {
            const shop = shops.find(s => s.id === parseInt(e.target.value));
            setSelectedShop(shop);
          }}
          className="shop-select"
        >
          {shops.map(shop => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </select>
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
          className={`filter-btn ${filterStatus === 'PROCESSING' ? 'active' : ''}`}
          onClick={() => setFilterStatus('PROCESSING')}
        >
          <i className="fas fa-cog"></i>
          Đang xử lý
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
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <i className="fas fa-clipboard-list"></i>
          <h2>Không có đơn hàng nào</h2>
          <p>Shop của bạn chưa có đơn hàng nào {filterStatus && `ở trạng thái "${getStatusInfo(filterStatus).label}"`}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            const nextStatusOptions = getNextStatusOptions(order.status);
            const isUpdating = updatingStatus[order.id];

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
                  <div className="order-customer">
                    <i className="fas fa-user"></i>
                    <div>
                      <strong>{order.customer?.name || 'Khách hàng'}</strong>
                      {order.customer?.email && (
                        <span className="customer-email"> - {order.customer.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="order-date">
                    <i className="fas fa-calendar-alt"></i>
                    {formatDate(order.createdAt)}
                  </div>

                  <div className="order-items-preview">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="order-item-preview">
                        <div className="item-preview-image">
                          {item.shopProduct?.vegetable?.imageUrl ? (
                            <img 
                              src={item.shopProduct.vegetable.imageUrl} 
                              alt={item.shopProduct.vegetable.name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
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
                          <span className="item-price">{formatPrice(item.price)}</span>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="more-items">
                        +{order.items.length - 3} sản phẩm khác
                      </div>
                    )}
                  </div>

                  <div className="order-address">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <strong>{order.shippingAddress?.fullName}</strong>
                      <span> - {order.shippingAddress?.phone}</span>
                      <p>
                        {order.shippingAddress?.address}, {order.shippingAddress?.ward}, 
                        {order.shippingAddress?.district}, {order.shippingAddress?.city}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="order-notes">
                      <i className="fas fa-sticky-note"></i>
                      <span>{order.notes}</span>
                    </div>
                  )}

                  {order.paymentStatus && (
                    <div className="order-payment-status">
                      <i className="fas fa-credit-card"></i>
                      <span>Thanh toán: </span>
                      <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                        {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 
                         order.paymentStatus === 'PENDING' ? 'Chờ thanh toán' :
                         order.paymentStatus === 'EXPIRED' ? 'Hết hạn' :
                         order.paymentStatus === 'CANCELLED' ? 'Đã hủy' : order.paymentStatus}
                      </span>
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span>Tổng tiền:</span>
                    <strong className="total-price">{formatPrice(order.total)}</strong>
                  </div>
                  
                  {nextStatusOptions.length > 0 && (
                    <div className="order-actions">
                      {nextStatusOptions.map(status => {
                        const nextStatusInfo = getStatusInfo(status);
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(order.id, status)}
                            disabled={isUpdating}
                            className={`status-btn ${nextStatusInfo.color}`}
                          >
                            {isUpdating ? (
                              <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Đang cập nhật...
                              </>
                            ) : (
                              <>
                                <i className={`fas fa-${nextStatusInfo.icon}`}></i>
                                {nextStatusInfo.label}
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopOrderManagement;
