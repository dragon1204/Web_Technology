import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import shopService from '../../services/shopService';
import '../../styles/ShopList.css';

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await shopService.getActiveShops();
      // Đảm bảo data luôn là array
      if (Array.isArray(data)) {
        setShops(data);
      } else {
        console.warn('Expected array but got:', data);
        setShops([]);
      }
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách shop. Vui lòng thử lại!');
      console.error('Error fetching shops:', err);
      setShops([]); // Đảm bảo shops luôn là array ngay cả khi có lỗi
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="shop-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách shop...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-list-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchShops} className="retry-button">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-list-container">
      <div className="shop-list-header">
        <h1>
          <i className="fas fa-store"></i>
          Danh Sách Cửa Hàng
        </h1>
        <p className="subtitle">Khám phá các cửa hàng rau sạch, an toàn</p>
      </div>

      {shops.length === 0 ? (
        <div className="no-shops">
          <i className="fas fa-store-slash"></i>
          <p>Chưa có cửa hàng nào</p>
        </div>
      ) : (
        <div className="shops-grid">
          {shops.map((shop) => (
            <Link to={`/customer/products/${shop.id}`} key={shop.id} className="shop-card">
              <div className="shop-card-header">
                <div className="shop-icon">
                  <i className="fas fa-store"></i>
                </div>
                <div className="shop-info">
                  <h3>{shop.name}</h3>
                  <p className="shop-owner">
                    <i className="fas fa-user"></i>
                    {shop.owner?.name || 'Chủ shop'}
                  </p>
                </div>
              </div>

              <div className="shop-card-body">
                <p className="shop-description">
                  {shop.description || 'Chuyên cung cấp rau sạch, an toàn'}
                </p>
              </div>

              <div className="shop-card-footer">
                <div className="shop-stats">
                  <div className="stat-item">
                    <i className="fas fa-box"></i>
                    <span>{shop._count?.products || 0} sản phẩm</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-shopping-bag"></i>
                    <span>{shop._count?.orders || 0} đơn hàng</span>
                  </div>
                </div>
                <div className="shop-status">
                  <span className={`status-badge ${shop.isActive ? 'active' : 'inactive'}`}>
                    {shop.isActive ? 'Đang hoạt động' : 'Tạm đóng'}
                  </span>
                </div>
              </div>

              <div className="shop-card-action">
                <span className="view-shop-btn">
                  Xem sản phẩm
                  <i className="fas fa-arrow-right"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopList;
