// ProductList.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getProductsApi, searchProductsApi } from '../util/api';
import './productList.css';

const ProductCard = ({ p }) => (
  <div className="product-card">
    <img
      src={p.image || 'https://via.placeholder.com/120x80'}
      alt={p.title}
      className="product-image"
    />
    <div className="product-info">
      <h4 className="product-title">{p.title}</h4>
      <p className="product-desc">{p.description}</p>
      <div className="product-meta">
        {p.category ? (p.category.name || p.category) : 'Không phân loại'} • ${p.price ?? 0}
      </div>
    </div>
  </div>
);

export default function ProductList({ category: initialCategory = 'all', pageSize = 10 }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // filter chính thức (đang áp dụng)
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // filter tạm (chỉ thay đổi khi user nhập, chưa áp dụng)
  const [tempCategory, setTempCategory] = useState(initialCategory);
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');

  const observerRef = useRef(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const fetchPage = useCallback(async (pageToLoad) => {
    if ((pageToLoad === 1 && loading) || (pageToLoad !== 1 && loadingMore)) return;

    if (pageToLoad === 1) {
      setLoading(true);
      setLoadingMore(false);
    } else {
      setLoadingMore(true);
    }

    try {
      let res;
      if (keyword || category !== 'all' || minPrice || maxPrice) {
        res = await searchProductsApi({
          keyword,
          category,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          page: pageToLoad,
          limit: pageSize,
        });
      } else {
        res = await getProductsApi({ category, page: pageToLoad, limit: pageSize });
      }

      if (res && res.EC === 0 && res.DT) {
        const newItems = res.DT.items || [];
        setItems(prev => (pageToLoad === 1 ? newItems : [...prev, ...newItems]));
        setHasMore(Boolean(res.DT.hasMore));
      } else {
        if (pageToLoad === 1) setItems([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('ProductList.fetchPage error', err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, pageSize, keyword, minPrice, maxPrice]);

  // reset khi filter chính thức thay đổi
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [category, keyword, minPrice, maxPrice,]);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const lastElementRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
        setTimeout(() => setPage(p => p + 1), 200);
      }
    }, { rootMargin: '100px' });
    if (node) observerRef.current.observe(node);
  }, [hasMore, loading, loadingMore]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      {/* Thanh filter */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Keyword search realtime (Enter) */}
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
          style={{ padding: 8, minWidth: 200 }}
        />

        {/* Category select (chỉ apply khi bấm nút) */}
        <select value={tempCategory} onChange={(e) => setTempCategory(e.target.value)} style={{ padding: 8 }}>
          <option value="all">Tất cả danh mục</option>
          <option value="Laptop">Laptop</option>
          <option value="Điện thoại">Điện thoại</option>
          <option value="Phụ kiện">Phụ kiện</option>
        </select>

        {/* Price inputs (chỉ apply khi bấm nút) */}
        <input
          type="number"
          placeholder="Giá từ"
          value={tempMinPrice}
          onChange={(e) => setTempMinPrice(e.target.value)}
          style={{ padding: 8, width: 100 }}
        />
        <input
          type="number"
          placeholder="Đến"
          value={tempMaxPrice}
          onChange={(e) => setTempMaxPrice(e.target.value)}
          style={{ padding: 8, width: 100 }}
        />

        {/* Button apply filter */}
        <button
          onClick={() => {
            setCategory(tempCategory);
            setMinPrice(tempMinPrice);
            setMaxPrice(tempMaxPrice);
            setPage(1);
          }}
        >
          Lọc
        </button>

        <button
          onClick={() => {
            // reset filter chính thức
            setCategory('all');
            setMinPrice('');
            setMaxPrice('');
            setKeyword('');

            // reset filter tạm
            setTempCategory('all');
            setTempMinPrice('');
            setTempMaxPrice('');

            // reset danh sách
            setItems([]);
            setPage(1); // useEffect sẽ tự fetch với filter mới
           // fetchPage(1);
            setResetTrigger(prev => prev + 1); // ép useEffect chạy lại
          }}
        >
          Reset
        </button>
      </div>

      

      {/* Render products */}
      {items.length === 0 && loading && <div>Đang tải...</div>}
      {items.length === 0 && !loading && <div>Không có sản phẩm</div>}

      {items.map((p, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={p._id || p.id || idx} ref={isLast ? lastElementRef : null}>
            <ProductCard p={p} />
          </div>
        );
      })}

      {loadingMore && <div className="spinner-wrap"><div className="spinner" /></div>}
    </div>
  );
}
