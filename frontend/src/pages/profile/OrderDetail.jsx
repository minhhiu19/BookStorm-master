import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineChevronLeft,
  HiOutlineCheck,
  HiOutlineTruck,
  HiOutlineClipboardCheck,
  HiOutlineShoppingBag,
  HiX,
} from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import orderService from '../../services/orderService';
import styles from './OrderDetail.module.css';

const TIMELINE_STEPS = [
  { key: 'PENDING', label: 'Đặt hàng', icon: HiOutlineShoppingBag },
  { key: 'CONFIRMED', label: 'Xác nhận', icon: HiOutlineClipboardCheck },
  { key: 'SHIPPING', label: 'Đang giao', icon: HiOutlineTruck },
  { key: 'DELIVERED', label: 'Đã giao', icon: HiOutlineCheck },
];

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];

const STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', className: 'statusPending' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'statusConfirmed' },
  SHIPPING: { label: 'Đang giao', className: 'statusShipping' },
  DELIVERED: { label: 'Đã giao', className: 'statusDelivered' },
  CANCELLED: { label: 'Đã hủy', className: 'statusCancelled' },
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const RETURN_REASONS = [
  'Sản phẩm bị lỗi/hỏng',
  'Sản phẩm không đúng mô tả',
  'Sai kích cỡ/màu sắc',
  'Không hài lòng với chất lượng',
  'Nhận nhầm sản phẩm',
  'Khác',
];

const SHIPPING_STATUS_MAP = {
  PENDING: 'Chờ lấy hàng',
  PICKED_UP: 'Đã lấy hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  DELIVERED: 'Đã giao hàng',
  FAILED: 'Giao hàng thất bại',
};

const OrderDetail = () => {
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState(false);
  const [returnForm, setReturnForm] = useState({ reason: '', description: '' });
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderByCode(orderCode);
        setOrder(response.data);
        // Fetch shipping info
        try {
          const shippingRes = await orderService.getOrderShipping(orderCode);
          setShipping(shippingRes.data || null);
        } catch {
          setShipping(null);
        }
      } catch {
        toast.error('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderCode]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      await orderService.cancelOrder(orderCode);
      toast.success('Đã hủy đơn hàng thành công');
      const response = await orderService.getOrderByCode(orderCode);
      setOrder(response.data);
    } catch {
      toast.error('Không thể hủy đơn hàng');
    }
  };

  const handleSubmitReturn = async () => {
    if (!returnForm.reason.trim()) {
      toast.error('Vui lòng chọn lý do đổi/trả');
      return;
    }
    setSubmittingReturn(true);
    try {
      await orderService.createReturnRequest(orderCode, returnForm.reason, returnForm.description);
      toast.success('Gửi yêu cầu đổi/trả thành công');
      setReturnModal(false);
      const response = await orderService.getOrderByCode(orderCode);
      setOrder(response.data);
    } catch {
      toast.error('Không thể gửi yêu cầu đổi/trả');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStepStatus = (stepKey) => {
    if (!order || order.status === 'CANCELLED') return 'inactive';
    const currentIdx = STATUS_ORDER.indexOf(order.status);
    const stepIdx = STATUS_ORDER.indexOf(stepKey);
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'inactive';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.notFound}>
        <p>Không tìm thấy đơn hàng</p>
        <Link to="/profile/orders" className={styles.backLink}>
          Quay lại đơn hàng
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || {
    label: order.status,
    className: 'statusPending',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back Link */}
      <Link to="/profile/orders" className={styles.backLink}>
        <HiOutlineChevronLeft />
        Quay lại đơn hàng
      </Link>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.orderTitle}>
            Đơn hàng #{order.orderCode}
          </h2>
          {order.createdAt && (
            <span className={styles.orderDate}>
              {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
            </span>
          )}
        </div>
        <span className={`${styles.statusBadge} ${styles[statusInfo.className]}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className={styles.timeline}>
          {TIMELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const stepStatus = getStepStatus(step.key);
            return (
              <div
                key={step.key}
                className={`${styles.timelineStep} ${styles[`step_${stepStatus}`]}`}
              >
                <div className={styles.stepIcon}>
                  <Icon />
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`${styles.stepLine} ${
                      stepStatus === 'completed' ? styles.stepLineActive : ''
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shipping Info */}
      {order.shippingAddress && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Thông tin giao hàng</h3>
          <div className={styles.shippingInfo}>
            <div>
              <span className={styles.shippingLabel}>Người nhận</span>
              <span className={styles.shippingValue}>{order.customerName}</span>
            </div>
            <div>
              <span className={styles.shippingLabel}>Địa chỉ</span>
              <span className={styles.shippingValue}>{order.shippingAddress}</span>
            </div>
            {shipping && shipping.trackingCode && (
              <div>
                <span className={styles.shippingLabel}>Mã vận đơn</span>
                <span className={styles.shippingValue}>{shipping.trackingCode}</span>
              </div>
            )}
            {shipping && shipping.carrier && (
              <div>
                <span className={styles.shippingLabel}>Đơn vị vận chuyển</span>
                <span className={styles.shippingValue}>{shipping.carrier}</span>
              </div>
            )}
            {shipping && shipping.status && (
              <div>
                <span className={styles.shippingLabel}>Trạng thái vận chuyển</span>
                <span className={`${styles.shippingValue} ${styles.shippingStatus}`}>
                  {SHIPPING_STATUS_MAP[shipping.status] || shipping.status}
                </span>
              </div>
            )}
            {shipping && shipping.estimatedDelivery && (
              <div>
                <span className={styles.shippingLabel}>Dự kiến giao hàng</span>
                <span className={styles.shippingValue}>
                  {format(new Date(shipping.estimatedDelivery), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>
            )}
            {shipping && shipping.shippedAt && (
              <div>
                <span className={styles.shippingLabel}>Ngày gửi hàng</span>
                <span className={styles.shippingValue}>
                  {format(new Date(shipping.shippedAt), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>
            )}
            {shipping && shipping.deliveredAt && (
              <div>
                <span className={styles.shippingLabel}>Ngày giao hàng</span>
                <span className={styles.shippingValue}>
                  {format(new Date(shipping.deliveredAt), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>
            )}
            {shipping && shipping.note && (
              <div>
                <span className={styles.shippingLabel}>Ghi chú vận chuyển</span>
                <span className={styles.shippingValue}>{shipping.note}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Sản phẩm</h3>
        <div className={styles.itemsTable}>
          <div className={styles.tableHeader}>
            <span className={styles.colProduct}>Sản phẩm</span>
            <span className={styles.colPrice}>Đơn giá</span>
            <span className={styles.colQty}>SL</span>
            <span className={styles.colSubtotal}>Thành tiền</span>
          </div>
          {(order.orderItems || order.items || []).map((item, idx) => (
            <div key={idx} className={styles.tableRow}>
              <div className={styles.colProduct}>
                <div className={styles.itemImage}>
                  <img
                    src={item.bookImage || item.image || item.productImage || '/placeholder.jpg'}
                    alt={item.bookName || item.name || item.productName || ''}
                  />
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>
                    {item.bookName || item.name || item.productName}
                  </span>
                  {item.bookAuthor && (
                    <span className={styles.itemVariant}>
                      Tác giả: {item.bookAuthor}
                    </span>
                  )}
                </div>
              </div>
              <span className={styles.colPrice}>{formatPrice(item.price)}</span>
              <span className={styles.colQty}>{item.quantity}</span>
              <span className={styles.colSubtotal}>
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className={styles.paymentSummary}>
        <div className={styles.summaryRow}>
          <span>Tạm tính</span>
          <span>{formatPrice(order.totalAmount || 0)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Phí vận chuyển</span>
          <span>
            {(order.shippingFee || 0) === 0
              ? 'Miễn phí'
              : formatPrice(order.shippingFee)}
          </span>
        </div>
        {(order.discountAmount || 0) > 0 && (
          <div className={styles.summaryRow}>
            <span>Giảm giá</span>
            <span className={styles.discountText}>
              -{formatPrice(order.discountAmount)}
            </span>
          </div>
        )}
        <div className={styles.summaryDivider} />
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span>Tổng cộng</span>
          <span>{formatPrice(order.finalAmount)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Phương thức thanh toán</h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán qua VNPay'}
          {' — '}
          <span style={{ color: order.paymentStatus === 'PAID' ? 'var(--color-success)' : 'var(--color-text-light)' }}>
            {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </span>
        </p>
        {order.note && (
          <div style={{ marginTop: '12px' }}>
            <span className={styles.shippingLabel}>Ghi chú</span>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{order.note}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {order.status === 'PENDING' && (
          <button className={styles.cancelBtn} onClick={handleCancelOrder}>
            Hủy đơn hàng
          </button>
        )}
        {order.status === 'DELIVERED' && (
          <>
            <button className={styles.reviewBtn}>Đánh giá</button>
            <button
              className={styles.returnBtn}
              onClick={() => {
                setReturnModal(true);
                setReturnForm({ reason: '', description: '' });
              }}
            >
              Yêu cầu đổi/trả
            </button>
          </>
        )}
      </div>
      {/* Return Request Modal */}
      {returnModal && (
        <div className={styles.modalOverlay} onClick={() => setReturnModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Yêu cầu đổi/trả hàng</h3>
              <button className={styles.modalClose} onClick={() => setReturnModal(false)}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalOrderCode}>
                Đơn hàng: <strong>#{orderCode}</strong>
              </p>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Lý do đổi/trả *</label>
                <select
                  className={styles.modalSelect}
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm((prev) => ({ ...prev, reason: e.target.value }))}
                >
                  <option value="">-- Chọn lý do --</option>
                  {RETURN_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Mô tả chi tiết</label>
                <textarea
                  className={styles.modalTextarea}
                  rows={3}
                  placeholder="Mô tả thêm về vấn đề bạn gặp phải..."
                  value={returnForm.description}
                  onChange={(e) => setReturnForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setReturnModal(false)}>
                Hủy
              </button>
              <button
                className={styles.modalSubmitBtn}
                onClick={handleSubmitReturn}
                disabled={submittingReturn}
              >
                {submittingReturn ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrderDetail;
