import React, { useState, useEffect, useCallback } from 'react';
import { HiEye, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminService from '../../services/adminService';
import styles from './Orders.module.css';

const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const STATUS_TABS = [
  { key: '', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'DELIVERED', label: 'Đã giao' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', className: 'badgePending' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'badgeConfirmed' },
  SHIPPING: { label: 'Đang giao', className: 'badgeShipping' },
  DELIVERED: { label: 'Đã giao', className: 'badgeDelivered' },
  CANCELLED: { label: 'Đã hủy', className: 'badgeCancelled' },
};

const PAYMENT_STATUS_MAP = {
  PAID: { label: 'Đã thanh toán', className: 'badgePaid' },
  UNPAID: { label: 'Chưa thanh toán', className: 'badgeUnpaid' },
  PENDING: { label: 'Chờ thanh toán', className: 'badgeUnpaid' },
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = activeTab
        ? await adminService.getOrdersByStatus(activeTab, page, 20)
        : await adminService.getOrders(page, 20);
      const data = res.data || res;
      setOrders(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(0);
  };

  const openDetail = async (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || '');
    try {
      setLoadingDetail(true);
      const res = await adminService.getOrderById(order.orderCode || order.id);
      setOrderDetail(res.data || res);
    } catch (error) {
      setOrderDetail(order);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelectedOrder(null);
    setOrderDetail(null);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      setUpdatingStatus(true);
      await adminService.updateOrderStatus(selectedOrder.orderCode || selectedOrder.id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      closeDetail();
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const detail = orderDetail || selectedOrder;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Quản lý đơn hàng</h1>

      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Đang tải...
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>Không có đơn hàng nào</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Ngày</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusInfo = STATUS_MAP[order.status] || { label: order.status, className: 'badgePending' };
                    const paymentInfo = PAYMENT_STATUS_MAP[order.paymentStatus] || { label: order.paymentStatus || '---', className: 'badgeUnpaid' };
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 500 }}>{order.orderCode || `#${order.id}`}</td>
                        <td>{order.customerName || order.user?.fullName || '---'}</td>
                        <td>{order.itemCount || order.items?.length || order.orderItems?.length || 0} sản phẩm</td>
                        <td style={{ fontWeight: 500 }}>{formatVND(order.totalAmount || 0)}</td>
                        <td>
                          <div className={styles.paymentInfo}>
                            <span className={styles.paymentMethod}>{order.paymentMethod || '---'}</span>
                            <span className={`${styles.badge} ${styles[paymentInfo.className]}`}>
                              {paymentInfo.label}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles[statusInfo.className]}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <button className={styles.viewBtn} onClick={() => openDetail(order)}>
                            <HiEye style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.pageBtn} ${page === i ? styles.pageBtnActive : ''}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={closeDetail}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Chi tiết đơn hàng {detail?.orderCode || `#${detail?.id}`}
              </h2>
              <button className={styles.modalClose} onClick={closeDetail}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              {loadingDetail ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  Đang tải...
                </div>
              ) : detail ? (
                <>
                  {/* Order Info */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailSectionTitle}>Thông tin đơn hàng</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Mã đơn</span>
                        <span className={styles.detailValue}>{detail.orderCode || `#${detail.id}`}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Ngày đặt</span>
                        <span className={styles.detailValue}>{formatDate(detail.createdAt)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Trạng thái</span>
                        <span className={styles.detailValue}>
                          <span className={`${styles.badge} ${styles[STATUS_MAP[detail.status]?.className || 'badgePending']}`}>
                            {STATUS_MAP[detail.status]?.label || detail.status}
                          </span>
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Tổng tiền</span>
                        <span className={styles.detailValue}>{formatVND(detail.totalAmount || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailSectionTitle}>Thông tin khách hàng</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Họ tên</span>
                        <span className={styles.detailValue}>{detail.customerName || detail.user?.fullName || detail.shippingName || '---'}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>SĐT</span>
                        <span className={styles.detailValue}>{detail.customerPhone || detail.user?.phone || detail.shippingPhone || '---'}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Email</span>
                        <span className={styles.detailValue}>{detail.customerEmail || detail.user?.email || '---'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailSectionTitle}>Thông tin giao hàng</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                        <span className={styles.detailLabel}>Địa chỉ</span>
                        <span className={styles.detailValue}>{detail.shippingAddress || detail.address?.fullAddress || '---'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailSectionTitle}>Sản phẩm</h3>
                    <div className={styles.tableWrapper}>
                      <table className={styles.itemsTable}>
                        <thead>
                          <tr>
                            <th>Ảnh</th>
                            <th>Tên sách</th>
                            <th>SL</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(detail.orderItems || detail.items || []).map((item, idx) => {
                            const img = item.bookImage || item.image || item.productImage;
                            const name = item.bookName || item.name || item.productName || '---';
                            return (
                            <tr key={idx}>
                              <td>
                                {img ? (
                                  <img src={img} alt={name} className={styles.itemImage} />
                                ) : (
                                  <div className={styles.itemImage} style={{ background: 'var(--color-bg)' }} />
                                )}
                              </td>
                              <td style={{ whiteSpace: 'normal', minWidth: 200 }}>
                                {name}
                              </td>
                              <td>{item.quantity || 0}</td>
                              <td>{formatVND(item.price || 0)}</td>
                              <td style={{ fontWeight: 500 }}>{formatVND(item.subtotal || (item.price || 0) * (item.quantity || 0))}</td>
                            </tr>
                          );})}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className={styles.statusUpdate}>
                    <select
                      className={styles.statusSelect}
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="PENDING">Chờ xác nhận</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="SHIPPING">Đang giao</option>
                      <option value="DELIVERED">Đã giao</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                    <button
                      className={styles.btnPrimary}
                      onClick={handleStatusUpdate}
                      disabled={updatingStatus || newStatus === detail.status}
                    >
                      {updatingStatus ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
