import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineClipboardList,
  HiX,
} from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import orderService from '../../services/orderService';
import styles from './MyOrders.module.css';

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'DELIVERED', label: 'Đã giao' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

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

const MyOrders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [returnModal, setReturnModal] = useState({ open: false, orderCode: '' });
  const [returnForm, setReturnForm] = useState({ reason: '', description: '' });
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders(page, 10);
      const data = response.data;
      setOrders(data.content || data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderCode) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      await orderService.cancelOrder(orderCode);
      toast.success('Đã hủy đơn hàng thành công');
      fetchOrders();
    } catch {
      toast.error('Không thể hủy đơn hàng');
    }
  };

  const handleOpenReturn = (orderCode) => {
    setReturnModal({ open: true, orderCode });
    setReturnForm({ reason: '', description: '' });
  };

  const handleSubmitReturn = async () => {
    if (!returnForm.reason.trim()) {
      toast.error('Vui lòng chọn lý do đổi/trả');
      return;
    }
    setSubmittingReturn(true);
    try {
      await orderService.createReturnRequest(
        returnModal.orderCode,
        returnForm.reason,
        returnForm.description
      );
      toast.success('Gửi yêu cầu đổi/trả thành công');
      setReturnModal({ open: false, orderCode: '' });
      fetchOrders();
    } catch {
      toast.error('Không thể gửi yêu cầu đổi/trả');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const filteredOrders =
    activeTab === 'ALL'
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={styles.contentTitle}>Đơn hàng của tôi</h2>

      {/* Status Tabs */}
      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(0);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className={styles.loadingState}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <HiOutlineClipboardList className={styles.emptyIcon} />
          <p>Không có đơn hàng nào</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className={styles.orderList}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filteredOrders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || {
                label: order.status,
                className: 'statusPending',
              };
              return (
                <div key={order.id || order.orderCode} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderCode}>
                        #{order.orderCode}
                      </span>
                      <span className={styles.orderDate}>
                        {order.createdAt
                          ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')
                          : ''}
                      </span>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[statusInfo.className]}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className={styles.orderItems}>
                    {(order.orderItems || order.items || []).slice(0, 3).map((item, idx) => (
                      <div key={idx} className={styles.orderItemPreview}>
                        <div className={styles.orderItemImage}>
                          <img
                            src={item.bookImage || item.image || item.productImage || '/placeholder.jpg'}
                            alt={item.bookName || item.name || item.productName || ''}
                          />
                        </div>
                        <div className={styles.orderItemInfo}>
                          <span className={styles.orderItemName}>
                            {item.bookName || item.name || item.productName}
                          </span>
                          <span className={styles.orderItemMeta}>
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(order.orderItems || order.items || []).length > 3 && (
                      <span className={styles.moreItems}>
                        +{(order.orderItems || order.items).length - 3} sách khác
                      </span>
                    )}
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.orderTotal}>
                      <span className={styles.orderTotalLabel}>
                        {order.itemCount || (order.items || []).length} sản phẩm
                      </span>
                      <span className={styles.orderTotalValue}>
                        Tổng: {formatPrice(order.totalAmount || order.total || 0)}
                      </span>
                    </div>
                    <div className={styles.orderActions}>
                      {order.status === 'PENDING' && (
                        <button
                          className={styles.cancelBtn}
                          onClick={() => handleCancelOrder(order.orderCode)}
                        >
                          Hủy đơn
                        </button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <>
                          <button className={styles.reviewBtn}>
                            Đánh giá
                          </button>
                          <button
                            className={styles.returnBtn}
                            onClick={() => handleOpenReturn(order.orderCode)}
                          >
                            Yêu cầu đổi/trả
                          </button>
                        </>
                      )}
                      <button
                        className={styles.detailBtn}
                        onClick={() =>
                          navigate(`/profile/orders/${order.orderCode}`)
                        }
                      >
                        Chi tiết
                        <HiOutlineChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

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
      {/* Return Request Modal */}
      {returnModal.open && (
        <div className={styles.modalOverlay} onClick={() => setReturnModal({ open: false, orderCode: '' })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Yêu cầu đổi/trả hàng</h3>
              <button
                className={styles.modalClose}
                onClick={() => setReturnModal({ open: false, orderCode: '' })}
              >
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalOrderCode}>
                Đơn hàng: <strong>#{returnModal.orderCode}</strong>
              </p>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Lý do đổi/trả *</label>
                <select
                  className={styles.modalSelect}
                  value={returnForm.reason}
                  onChange={(e) =>
                    setReturnForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setReturnForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setReturnModal({ open: false, orderCode: '' })}
              >
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

export default MyOrders;
