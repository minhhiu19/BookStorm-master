import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineTag,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import couponService from '../services/couponService';
import styles from './Cart.module.css';

const FREE_SHIPPING_THRESHOLD = 500000;

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const QuantitySelector = ({ quantity, onDecrease, onIncrease, disabled }) => (
  <div className={styles.quantitySelector}>
    <button
      className={styles.quantityBtn}
      onClick={onDecrease}
      disabled={disabled || quantity <= 1}
      aria-label="Giảm số lượng"
    >
      <HiOutlineMinus />
    </button>
    <span className={styles.quantityValue}>{quantity}</span>
    <button
      className={styles.quantityBtn}
      onClick={onIncrease}
      disabled={disabled}
      aria-label="Tăng số lượng"
    >
      <HiOutlinePlus />
    </button>
  </div>
);

const EmptyCart = () => (
  <motion.div
    className={styles.emptyState}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className={styles.emptyIcon}>
      <HiOutlineShoppingBag />
    </div>
    <h2 className={styles.emptyTitle}>Giỏ hàng trống</h2>
    <p className={styles.emptyText}>
      Bạn chưa có sách nào trong giỏ hàng
    </p>
    <Link to="/shop" className={styles.continueShopping}>
      Tiếp tục mua sắm
      <HiOutlineArrowRight />
    </Link>
  </motion.div>
);

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, updateCartItem, removeCartItem, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});

  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 30000;
  const discount = appliedCoupon ? Number(appliedCoupon.discountAmount) : 0;
  const totalAmount = cartTotal + shippingFee - discount;

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
    try {
      await updateCartItem(itemId, newQuantity);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
    try {
      await removeCartItem(itemId);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    setApplyingCoupon(true);
    try {
      const result = await couponService.applyCoupon(couponCode.trim(), cartTotal);
      setAppliedCoupon(result);
      toast.success(`Áp dụng mã giảm giá thành công! Giảm ${formatPrice(result.discountAmount)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleCheckout = () => {
    navigate('/checkout', {
      state: appliedCoupon ? { couponCode: couponCode.trim(), discount } : undefined,
    });
  };

  if (!loading && cartItems.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <EmptyCart />
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
          Giỏ hàng
        </motion.h1>

        <div className={styles.cartLayout}>
          {/* Cart Items */}
          <div className={styles.cartItems}>
            <div className={styles.cartHeader}>
              <span className={styles.cartHeaderProduct}>Sách</span>
              <span className={styles.cartHeaderPrice}>Đơn giá</span>
              <span className={styles.cartHeaderQty}>Số lượng</span>
              <span className={styles.cartHeaderSubtotal}>Thành tiền</span>
              <span className={styles.cartHeaderAction}></span>
            </div>

            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  className={styles.cartItem}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.itemProduct}>
                    <div className={styles.itemImage}>
                      <img
                        src={item.bookImage || item.image || item.productImage || '/placeholder.jpg'}
                        alt={item.bookName || item.name || item.productName || ''}
                      />
                    </div>
                    <div className={styles.itemInfo}>
                      <Link
                        to={`/book/${item.bookSlug || item.productSlug || item.bookId || item.productId}`}
                        className={styles.itemName}
                      >
                        {item.bookName || item.name || item.productName}
                      </Link>
                      {(item.bookAuthor || item.author) && (
                        <span className={styles.itemVariant}>
                          Tác giả: {item.bookAuthor || item.author}
                        </span>
                      )}
                      <span className={styles.itemPriceMobile}>
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.itemPrice}>
                    {formatPrice(item.price)}
                  </div>

                  <div className={styles.itemQty}>
                    <QuantitySelector
                      quantity={item.quantity}
                      onDecrease={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      onIncrease={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={updatingItems[item.id]}
                    />
                  </div>

                  <div className={styles.itemSubtotal}>
                    {formatPrice(item.price * item.quantity)}
                  </div>

                  <div className={styles.itemAction}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updatingItems[item.id]}
                      aria-label="Xóa sách"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            className={styles.orderSummary}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>

            <div className={styles.summaryRow}>
              <span>Tạm tính</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Phí vận chuyển</span>
              <span className={shippingFee === 0 ? styles.freeShipping : ''}>
                {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
              </span>
            </div>

            {shippingFee > 0 && (
              <p className={styles.shippingNote}>
                Miễn phí vận chuyển cho đơn hàng từ{' '}
                {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </p>
            )}

            {discount > 0 && (
              <div className={styles.summaryRow}>
                <span>Giảm giá</span>
                <span style={{ color: '#e53e3e' }}>-{formatPrice(discount)}</span>
              </div>
            )}

            <div className={styles.summaryDivider} />

            {/* Coupon */}
            <div className={styles.couponSection}>
              {appliedCoupon ? (
                <div className={styles.couponApplied || styles.couponInput}>
                  <HiOutlineTag className={styles.couponIcon} />
                  <span style={{ flex: 1 }}>Mã <strong>{couponCode}</strong> - Giảm {formatPrice(discount)}</span>
                  <button
                    className={styles.couponBtn}
                    onClick={handleRemoveCoupon}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div className={styles.couponInput}>
                  <HiOutlineTag className={styles.couponIcon} />
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    className={styles.couponBtn}
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                  >
                    {applyingCoupon ? '...' : 'Áp dụng'}
                  </button>
                </div>
              )}
            </div>

            <div className={styles.summaryDivider} />

            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Tổng cộng</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={loading}
            >
              Tiến hành đặt hàng
              <HiOutlineArrowRight />
            </button>

            <Link to="/shop" className={styles.continueLink}>
              Tiếp tục mua sắm
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
