import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineSearch } from 'react-icons/hi';
import staffService from '../../services/staffService';
import Loading from '../../components/common/Loading';
import styles from './StaffSupport.module.css';

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StaffSupport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [expandedDetail, setExpandedDetail] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await staffService.getSupportOrders(page, 20, searchTerm);
      const data = response.data || response;
      setOrders(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchOrders();
  };

  const handleToggleExpand = async (orderCode, orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      setExpandedDetail(null);
      return;
    }

    setExpandedOrder(orderId);
    try {
      const response = await staffService.getOrderById(orderCode);
      setExpandedDetail(response.data || response);
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng');
      console.error('Failed to fetch order detail:', error);
      setExpandedOrder(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return styles.statusPending;
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'SHIPPING': return styles.statusShipping;
      case 'DELIVERED': return styles.statusDelivered;
      case 'CANCELLED': return styles.statusCancelled;
      default: return '';
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return (
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          &lsaquo;
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
            onClick={() => setPage(p)}
          >
            {p + 1}
          </button>
        ))}
        <button
          className={styles.pageBtn}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
        >
          &rsaquo;
        </button>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hỗ trợ khách hàng</h1>
        <p className={styles.subtitle}>
          Xem và theo dõi đơn hàng của khách hàng để hỗ trợ khi cần
        </p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchBox}>
            <HiOutlineSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.searchBtn}>
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingOverlay}>
            <Loading />
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><HiOutlineSearch /></div>
            <h3>Không tìm thấy đơn hàng nào</h3>
            <p>Thử tìm kiếm với từ khóa khác hoặc làm mới trang</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Email</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr>
                      <td>
                        <span
                          className={styles.orderCode}
                          onClick={() => handleToggleExpand(order.orderCode, order.id)}
                        >
                          {order.orderCode || `#${order.id}`}
                        </span>
                      </td>
                      <td>
                        <span className={styles.customerName}>
                          {order.customerName || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={styles.phone}>
                          {order.customerEmail || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={styles.amount}>
                          {formatCurrency(order.totalAmount || 0)}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td>
                        <span className={styles.date}>
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.detailBtn}
                          onClick={() => handleToggleExpand(order.orderCode, order.id)}
                        >
                          {expandedOrder === order.id ? 'Thu gọn' : 'Chi tiết'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Order Detail */}
                    {expandedOrder === order.id && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={7}>
                          <div className={styles.orderDetail}>
                            {!expandedDetail ? (
                              <Loading />
                            ) : (
                              <>
                                <div className={styles.detailGrid}>
                                  <div className={styles.detailSection}>
                                    <h4>Thông tin giao hàng</h4>
                                    <p>
                                      <strong>Khách hàng:</strong>{' '}
                                      {expandedDetail.customerName || 'N/A'}
                                      <br />
                                      <strong>Email:</strong>{' '}
                                      {expandedDetail.customerEmail || 'N/A'}
                                      <br />
                                      <strong>Địa chỉ:</strong>{' '}
                                      {expandedDetail.shippingAddress || 'Không có địa chỉ'}
                                    </p>
                                  </div>
                                  <div className={styles.detailSection}>
                                    <h4>Thông tin thanh toán</h4>
                                    <p>
                                      <strong>Phương thức:</strong>{' '}
                                      {expandedDetail.paymentMethod || 'COD'}
                                      <br />
                                      <strong>Thanh toán:</strong>{' '}
                                      {expandedDetail.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                      <br />
                                      <strong>Tạm tính:</strong>{' '}
                                      {formatCurrency(expandedDetail.totalAmount || 0)}
                                      <br />
                                      <strong>Phí ship:</strong>{' '}
                                      {formatCurrency(expandedDetail.shippingFee || 0)}
                                      <br />
                                      <strong>Giảm giá:</strong>{' '}
                                      -{formatCurrency(expandedDetail.discountAmount || 0)}
                                      <br />
                                      <strong className={styles.totalAmount}>
                                        Tổng cộng: {formatCurrency(expandedDetail.finalAmount || 0)}
                                      </strong>
                                    </p>
                                  </div>
                                </div>

                                {expandedDetail.note && (
                                  <div className={styles.detailSection} style={{ marginBottom: 16 }}>
                                    <h4>Ghi chú từ khách hàng</h4>
                                    <p className={styles.noteText}>{expandedDetail.note}</p>
                                  </div>
                                )}

                                <div className={styles.detailSection}>
                                  <h4>Sách trong đơn hàng</h4>
                                  <table className={styles.itemsTable}>
                                    <thead>
                                      <tr>
                                        <th>Sách</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(expandedDetail.orderItems || expandedDetail.items || []).map(
                                        (item, idx) => {
                                          const img = item.bookImage || item.productImage;
                                          const name = item.bookName || item.productName || 'Sách';
                                          return (
                                          <tr key={item.id || idx}>
                                            <td>
                                              <div className={styles.itemInfo}>
                                                {img && (
                                                  <img
                                                    src={img}
                                                    alt={name}
                                                    className={styles.itemImage}
                                                  />
                                                )}
                                                <div>
                                                  <div className={styles.itemName}>
                                                    {name}
                                                  </div>
                                                  {item.bookAuthor && (
                                                    <div className={styles.itemVariant}>
                                                      Tác giả: {item.bookAuthor}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.price || 0)}</td>
                                            <td>
                                              {formatCurrency(
                                                item.subtotal || (item.price || 0) * (item.quantity || 0)
                                              )}
                                            </td>
                                          </tr>
                                        );}
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffSupport;
