import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import cartService from '../../services/cartService';
import shopService from '../../services/shopService';
import storageService from '../../services/storageService';
import '../../styles/ProductList.css';

const ProductList = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    if (shopId) {
      fetchShopDetails();
    }
    fetchCartCount();
  }, [shopId, searchTerm, category, sortBy, order, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...(shopId && { shopId }),
        ...(searchTerm && { search: searchTerm }),
        ...(category && { category }),
        sortBy,
        order,
      };
      
      const data = await productService.searchProducts(params);
      
      // Load images for products
      const productsWithImages = await Promise.all(
        data.items.map(async (product) => {
          if (product.vegetable?.image) {
            try {
              console.log('🖼️ Loading image for:', product.vegetable.name, 'File:', product.vegetable.image);
              const url = await storageService.getImageUrl(product.vegetable.image);
              console.log('✅ Image URL loaded:', url);
              if (url) {
                return {
                  ...product,
                  vegetable: {
                    ...product.vegetable,
                    imageUrl: url,
                  },
                };
              } else {
                console.warn('⚠️ No URL returned for image:', product.vegetable.image);
              }
            } catch (err) {
              console.error('❌ Error loading image:', err);
              return product;
            }
          }
          return product;
        })
      );
      
      setProducts(productsWithImages);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError('Không thể tải sản phẩm. Vui lòng thử lại!');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopDetails = async () => {
    try {
      const data = await shopService.getShopDetails(shopId);
      setShop(data);
    } catch (err) {
      console.error('Error fetching shop details:', err);
    }
  };

  const fetchCartCount = async () => {
    try {
      const cart = await cartService.getCart();
      setCartCount(cart.itemCount || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await cartService.addToCart({
        shopProductId: productId,
        quantity: 1,
      });
      
      alert('Đã thêm vào giỏ hàng!');
      fetchCartCount();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thêm vào giỏ hàng!');
      console.error('Error adding to cart:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      leafy: 'Rau lá',
      root: 'Củ',
      fruit: 'Quả',
      herb: 'Rau thơm',
    };
    return labels[cat] || cat;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="product-list-container">
      {/* Header */}
      <div className="product-list-header">
        {shop ? (
          <>
            <button onClick={() => navigate('/customer/shops')} className="back-button">
              <i className="fas fa-arrow-left"></i>
              Quay lại
            </button>
            <div className="shop-banner">
              <div className="shop-banner-icon">
                <i className="fas fa-store"></i>
              </div>
              <div className="shop-banner-info">
                <h1>{shop.name}</h1>
                <p>{shop.description}</p>
                <span className="shop-owner">
                  <i className="fas fa-user"></i>
                  {shop.owner?.name}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="all-products-header">
            <h1>
              <i className="fas fa-shopping-basket"></i>
              Tất Cả Sản Phẩm
            </h1>
            <p className="subtitle">Rau sạch, an toàn cho sức khỏe</p>
          </div>
        )}

        {/* Cart Badge */}
        <button className="cart-badge" onClick={() => navigate('/customer/cart')}>
          <i className="fas fa-shopping-cart"></i>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <i className="fas fa-search"></i>
          </button>
        </form>

        <div className="filter-controls">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">Tất cả loại</option>
            <option value="leafy">Rau lá</option>
            <option value="root">Củ</option>
            <option value="fruit">Quả</option>
            <option value="herb">Rau thơm</option>
          </select>

          <select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [newSortBy, newOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setOrder(newOrder);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="name-asc">Tên: A-Z</option>
            <option value="name-desc">Tên: Z-A</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="createdAt-desc">Mới nhất</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-button">Thử lại</button>
        </div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <i className="fas fa-box-open"></i>
          <p>Không có sản phẩm nào</p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.vegetable?.imageUrl ? (
                    <img 
                      src={product.vegetable.imageUrl} 
                      alt={product.vegetable.name}
                      onError={(e) => {
                        console.error('Image load error:', product.vegetable.imageUrl);
                        e.target.style.display = 'none';
                        e.target.nextElementSibling?.style?.display === 'none' && 
                          (e.target.nextElementSibling.style.display = 'flex');
                      }}
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <i className="fas fa-leaf"></i>
                    </div>
                  )}
                  <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
                  </span>
                </div>

                <div className="product-content">
                  <span className="product-category">
                    {getCategoryLabel(product.vegetable.category)}
                  </span>
                  <h3 className="product-name">{product.vegetable.name}</h3>
                  <p className="product-description">
                    {product.vegetable.description || 'Rau sạch, an toàn'}
                  </p>

                  <div className="product-meta">
                    <div className="garden-info">
                      <i className="fas fa-seedling"></i>
                      <span>{product.garden.name}</span>
                    </div>
                    {!shopId && product.shop && (
                      <div className="shop-info">
                        <i className="fas fa-store"></i>
                        <span>{product.shop.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="product-footer">
                    <div className="product-price">
                      {formatPrice(product.price)}
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={!product.isAvailable || product.stock === 0}
                    >
                      <i className="fas fa-cart-plus"></i>
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <span className="pagination-info">
                Trang {page} / {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;
