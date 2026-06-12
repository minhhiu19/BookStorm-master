import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlinePlus,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import orderService from '../services/orderService';
import styles from './Checkout.module.css';

const FREE_SHIPPING_THRESHOLD = 500000;
const PROVINCES_API = 'https://provinces.open-api.vn/api';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const couponFromCart = location.state?.couponCode || null;
  const discountFromCart = location.state?.discount || 0;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    addressDetail: '',
  });

  // Province/District/Ward data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');

  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 30000;
  const discount = discountFromCart;
  const totalAmount = cartTotal + shippingFee - discount;

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get(`${PROVINCES_API}/p/`);
        setProvinces(res.data || []);
      } catch {
        // silent
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${PROVINCES_API}/p/${selectedProvinceCode}?depth=2`);
        setDistricts(res.data?.districts || []);
        setWards([]);
        setSelectedDistrictCode('');
        setAddressForm((prev) => ({ ...prev, district: '', ward: '' }));
      } catch {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await axios.get(`${PROVINCES_API}/d/${selectedDistrictCode}?depth=2`);
        setWards(res.data?.wards || []);
        setAddressForm((prev) => ({ ...prev, ward: '' }));
      } catch {
        setWards([]);
      }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await userService.getAddresses();
      const addrs = response.data || [];
      setAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrs.length > 0) {
        setSelectedAddressId(addrs[0].id);
      }
    } catch {
      // no addresses
    }
  };

  const handleAddressChange = (e) => {
    setAddressForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const province = provinces.find((p) => String(p.code) === code);
    setAddressForm((prev) => ({ ...prev, province: province?.name || '' }));
  };

  const handleDistrictChange = (e) => {
    const code = e.target.value;
    setSelectedDistrictCode(code);
    const district = districts.find((d) => String(d.code) === code);
    setAddressForm((prev) => ({ ...prev, district: district?.name || '' }));
  };

  const handleWardChange = (e) => {
    const code = e.target.value;
    const ward = wards.find((w) => String(w.code) === code);
    setAddressForm((prev) => ({ ...prev, ward: ward?.name || '' }));
  };

  const handleSaveAddress = async () => {
    const { fullName, phone, province, district, ward, addressDetail } = addressForm;
    if (!fullName || !phone || !province || !district || !ward || !addressDetail) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }
    try {
      const response = await userService.addAddress(addressForm);
      const newAddr = response.data;
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
      setShowAddressForm(false);
      toast.success('Đã thêm địa chỉ mới');
    } catch {
      toast.error('Không thể thêm địa chỉ');
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddressId && !showAddressForm) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod,
        note: note.trim() || undefined,
        couponCode: couponFromCart || undefined,
      };

      if (showAddressForm && !selectedAddressId) {
        const addrRes = await userService.addAddress(addressForm);
        orderData.addressId = addrRes.data.id;
      }

      const response = await orderService.createOrder(orderData);
      const order = response.data;

      if (paymentMethod === 'VNPAY' && order.paymentUrl) {
        window.location.href = order.paymentUrl;
        return;
      }

      await clearCart();
      navigate(`/order-success?code=${order.orderCode}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.h1
          className={styles.pageTitle}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Thanh toán
        </motion.h1>

        <div className={styles.checkoutLayout}>
          {/* Left: Form */}
          <div className={styles.formSection}>
            {/* Shipping Address */}
            <motion.div
              className={styles.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className={styles.sectionTitle}>
                <HiOutlineLocationMarker />
                Địa chỉ giao hàng
              </h2>

              {addresses.length > 0 && !showAddressForm && (
                <div className={styles.addressList}>
                  {addresses.map((addr) => (
                    <label key={addr.id} className={styles.addressCard}>
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className={styles.radioInput}
                      />
                      <div className={styles.addressContent}>
                        <div className={styles.addressHeader}>
                          <span className={styles.addressName}>
                            {addr.fullName}
                          </span>
                          <span className={styles.addressPhone}>
                            {addr.phone}
                          </span>
                          {addr.isDefault && (
                            <span className={styles.defaultBadge}>
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className={styles.addressDetail}>
                          {addr.addressDetail}, {addr.ward}, {addr.district},{' '}
                          {addr.province}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!showAddressForm && (
                <button
                  className={styles.addAddressBtn}
                  onClick={() => {
                    setShowAddressForm(true);
                    setSelectedAddressId(null);
                  }}
                >
                  <HiOutlinePlus />
                  Thêm địa chỉ mới
                </button>
              )}

              {showAddressForm && (
                <div className={styles.addressFormGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Họ tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={addressForm.fullName}
                      onChange={handleAddressChange}
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tỉnh/Thành phố</label>
                    <select
                      className={styles.selectInput}
                      value={selectedProvinceCode}
                      onChange={handleProvinceChange}
                    >
                      <option value="">-- Chọn tỉnh/thành phố --</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Quận/Huyện</label>
                    <select
                      className={styles.selectInput}
                      value={selectedDistrictCode}
                      onChange={handleDistrictChange}
                      disabled={!selectedProvinceCode}
                    >
                      <option value="">-- Chọn quận/huyện --</option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phường/Xã</label>
                    <select
                      className={styles.selectInput}
                      value={wards.find((w) => w.name === addressForm.ward)?.code || ''}
                      onChange={handleWardChange}
                      disabled={!selectedDistrictCode}
                    >
                      <option value="">-- Chọn phường/xã --</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>Địa chỉ chi tiết</label>
                    <input
                      type="text"
                      name="addressDetail"
                      value={addressForm.addressDetail}
                      onChange={handleAddressChange}
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                  <div className={styles.addressFormActions}>
                    {addresses.length > 0 && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => {
                          setShowAddressForm(false);
                          if (addresses.length > 0) {
                            setSelectedAddressId(
                              addresses.find((a) => a.isDefault)?.id ||
                                addresses[0].id
                            );
                          }
                        }}
                      >
                        Hủy
                      </button>
                    )}
                    <button
                      className={styles.saveAddressBtn}
                      onClick={handleSaveAddress}
                    >
                      Lưu địa chỉ
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              className={styles.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h2 className={styles.sectionTitle}>Phương thức thanh toán</h2>
              <div className={styles.paymentOptions}>
                <label className={styles.paymentCard}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={styles.radioInput}
                  />
                  <div className={styles.paymentContent}>
                    <HiOutlineTruck className={styles.paymentIcon} />
                    <div>
                      <span className={styles.paymentLabel}>
                        Thanh toán khi nhận hàng (COD)
                      </span>
                      <span className={styles.paymentDesc}>
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </span>
                    </div>
                  </div>
                </label>
                <label className={styles.paymentCard}>
                  <input
                    type="radio"
                    name="payment"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={styles.radioInput}
                  />
                  <div className={styles.paymentContent}>
                    <HiOutlineCreditCard className={styles.paymentIcon} />
                    <div>
                      <span className={styles.paymentLabel}>
                        Thanh toán qua VNPay
                      </span>
                      <span className={styles.paymentDesc}>
                        The ATM, Visa, MasterCard, QR Code
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Note */}
            <motion.div
              className={styles.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className={styles.sectionTitle}>Ghi chú</h2>
              <textarea
                className={styles.noteTextarea}
                rows={3}
                placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </motion.div>
          </div>

          {/* Right: Order Summary */}
          <motion.div
            className={styles.orderSummary}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <h2 className={styles.summaryTitle}>Đơn hàng của bạn</h2>

            <div className={styles.summaryItems}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemImage}>
                    <img
                      src={item.bookImage || item.image || item.productImage || '/placeholder.jpg'}
                      alt={item.bookName || item.name || item.productName || ''}
                    />
                    <span className={styles.summaryItemQty}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className={styles.summaryItemInfo}>
                    <span className={styles.summaryItemName}>
                      {item.bookName || item.name || item.productName}
                    </span>
                    {(item.bookAuthor || item.author) && (
                      <span className={styles.summaryItemVariant}>
                        {item.bookAuthor || item.author}
                      </span>
                    )}
                  </div>
                  <span className={styles.summaryItemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryRow}>
              <span>Tạm tính</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Phí vận chuyển</span>
              <span className={shippingFee === 0 ? styles.freeText : ''}>
                {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
              </span>
            </div>
            {discount > 0 && (
              <div className={styles.summaryRow}>
                <span>Giảm giá</span>
                <span className={styles.discountText}>
                  -{formatPrice(discount)}
                </span>
              </div>
            )}

            <div className={styles.summaryDivider} />

            <div className={`${styles.summaryRow} ${styles.summaryTotalRow}`}>
              <span>Tổng thanh toán</span>
              <span className={styles.totalPrice}>
                {formatPrice(totalAmount)}
              </span>
            </div>

            <button
              className={styles.placeOrderBtn}
              onClick={handleSubmitOrder}
              disabled={submitting}
            >
              {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
