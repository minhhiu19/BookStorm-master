import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineShoppingBag,
  HiOutlineArrowRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import wishlistService from '../services/wishlistService';
import { useCart } from '../context/CartContext';
import styles from './Wishlist.module.css';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const Wishlist = () => {
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [removingIds, setRemovingIds] = useState({});

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist(page, 12);
      const data = response.data;
      setItems(data.content || data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemovingIds((prev) => ({ ...prev, [productId]: true }));
    try {
      await wishlistService.removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => item.id !== productId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch {
      toast.error('Không thể xóa sách');
    } finally {
      setRemovingIds((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await addToCart(item.id, 1);
    } catch {
      // handled in context
    }
  };

  if (!loading && items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.emptyIcon}>
              <HiOutlineHeart />
            </div>
            <h2 className={styles.emptyTitle}>Chưa có sách yêu thích</h2>
            <p className={styles.emptyText}>
              Hãy thêm những cuốn sách bạn thích vào đây
            </p>
            <Link to="/shop" className={styles.shopBtn}>
              Khám phá sách
              <HiOutlineArrowRight />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.h1
          className={styles.pageTitle}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Yêu thích
        </motion.h1>

        {loading ? (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <>
            <div className={styles.productGrid}>
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  return (
                    <motion.div
                      key={item.id}
                      className={styles.productCard}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.cardImageWrapper}>
                        <Link to={`/book/${item.slug || item.id}`}>
                          <img
                            src={item.images?.[0]?.imageUrl}
                            alt={item.name}
                            className={styles.cardImage}
                          />
                        </Link>
                        <button
                          className={styles.removeWishlistBtn}
                          onClick={() => handleRemove(item.id)}
                          disabled={removingIds[item.id]}
                          aria-label="Xóa khỏi yêu thích"
                        >
                          <HiHeart />
                        </button>
                        <button
                          className={styles.addToCartBtn}
                          onClick={() => handleAddToCart(item)}
                          aria-label="Thêm vào giỏ hàng"
                        >
                          <HiOutlineShoppingBag />
                          <span>Thêm vào giỏ</span>
                        </button>
                      </div>
                      <div className={styles.cardInfo}>
                        <Link
                          to={`/book/${item.slug || item.id}`}
                          className={styles.cardName}
                        >
                          {item.name}
                        </Link>
                        <div className={styles.cardPriceRow}>
                          <span className={styles.cardPrice}>
                            {formatPrice(item.salePrice || item.basePrice || 0)}
                          </span>
                          {item.salePrice && item.basePrice > item.salePrice && (
                            <span className={styles.cardOriginalPrice}>
                              {formatPrice(item.basePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <HiOutlineChevronLeft />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.pageBtn} ${page === i ? styles.pageBtnActive : ''}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  <HiOutlineChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
