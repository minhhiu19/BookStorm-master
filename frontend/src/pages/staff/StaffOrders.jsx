import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineCube } from 'react-icons/hi';
import toast from 'react-hot-toast';
import staffService from '../../services/staffService';
import Loading from '../../components/common/Loading';
import styles from './StaffOrders.module.css';

const TABS = [
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'SHIPPING', label: 'Đang giao' },
];

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

const StaffOrders = () => {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [expandedDetail, setExpandedDetail] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [tabCounts, setTabCounts] = useState({ PENDING: 0, CONFIRMED: 0, SHIPPING: 0 });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await staffService.getOrders(page, 20, activeTab);
      const data = response.data || response;
      setOrders(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  const fetchTabCounts = useCallback(async () => {
    try {
      const promises = TABS.map((tab) =>
        staffService.getOrders(0, 1, tab.key).then((res) => {
          const data = res.data || res;
          return { key: tab.key, count: data.totalElements || 0 };
        }).catch(() => ({ key: tab.key, count: 0 }))
      );
      const results = await Promise.all(promises);
      const counts = {};
      results.forEach((r) => {
        counts[r.key] = r.count;
      });
      setTabCounts(counts);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchTabCounts();
  }, [fetchTabCounts]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
    setExpandedOrder(null);
    setExpandedDetail(null);
  };

  const handleConfirmOrder = async (orderCode, orderId) => {
    try {
      setActionLoading(orderId);
      await staffService.updateOrderStatus(orderCode, 'CONFIRMED');
      toast.success('Đơn hàng đã được xác nhận');
      fetchOrders();
      fetchTabCounts();
    } catch (error) {
      toast.error('Không thể xác nhận đơn hàng');
      console.error('Failed to confirm order:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleShipOrder = async (orderCode, orderId) => {
    try {
      setActionLoading(orderId);
      await staffService.updateOrderStatus(orderCode, 'SHIPPING');
      toast.success('Đơn hàng đã chuyển sang giao hàng');
      fetchOrders();
      fetchTabCounts();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái đơn hàng');
      console.error('Failed to update order:', error);
    } finally {
      setActionLoading(null);
    }
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

  const handleRefresh = () => {
    fetchOrders();
    fetchTabCounts();
  };

  const handlePrintSlip = (order, detail) => {
    const orderData = detail || order;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const items = orderData.items || orderData.orderItems || [];

    const formatCurrencyPrint = (amount) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const itemRows = items.map(item => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;">${item.productName || 'Sản phẩm'}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center;">${item.size || '-'}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center;">${item.color || '-'}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;">${formatCurrencyPrint(item.price)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phiếu giao hàng - ${orderData.orderCode || order.orderCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; font-size: 13px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
          .header p { font-size: 12px; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .info-box h3 { font-size: 13px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; color: #555; }
          .info-box p { font-size: 13px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          thead th { background: #f5f5f5; padding: 8px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #333; }
          .totals { text-align: right; margin-bottom: 30px; }
          .totals p { font-size: 13px; margin-bottom: 4px; }
          .totals .total-final { font-size: 16px; font-weight: bold; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; }
          .signatures p:first-child { font-weight: bold; font-size: 13px; }
          .signatures p:last-child { margin-top: 60px; font-size: 12px; color: #666; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BOOKSTORM</h1>
          <p>PHIẾU GIAO HÀNG</p>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>Thông tin đơn hàng</h3>
            <p>
              Mã đơn: <strong>${orderData.orderCode || order.orderCode || ''}</strong><br>
              Ngày đặt: ${orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}<br>
              Thanh toán: ${orderData.paymentMethod || order.paymentMethod || 'COD'}
            </p>
          </div>
          <div class="info-box">
            <h3>Thông tin giao hàng</h3>
            <p>
              Người nhận: <strong>${orderData.shippingName || order.shippingName || orderData.customerName || ''}</strong><br>
              SĐT: ${orderData.shippingPhone || order.shippingPhone || ''}<br>
              Địa chỉ: ${orderData.shippingAddress || order.shippingAddress || ''}
            </p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th style="text-align:center;">Size</th>
              <th style="text-align:center;">Màu</th>
              <th style="text-align:center;">SL</th>
              <th style="text-align:right;">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows || '<tr><td colspan="5" style="padding:8px;text-align:center;color:#999;">Không có chi tiết</td></tr>'}
          </tbody>
        </table>

        <div class="totals">
          <p>Tạm tính: ${formatCurrencyPrint(orderData.subtotal || orderData.totalAmount || order.totalAmount)}</p>
          <p>Phí vận chuyển: ${formatCurrencyPrint(orderData.shippingFee || 0)}</p>
          ${(orderData.discount || 0) > 0 ? `<p>Giảm giá: -${formatCurrencyPrint(orderData.discount)}</p>` : ''}
          <p class="total-final">Tổng cộng: ${formatCurrencyPrint(orderData.totalAmount || order.totalAmount)}</p>
        </div>

        ${orderData.note || order.note ? `<p style="margin-bottom:10px;"><strong>Ghi chú:</strong> ${orderData.note || order.note}</p>` : ''}

        <div class="signatures">
          <div>
            <p>Người gửi</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div>
            <p>Người nhận</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const handlePrintOrder = async (order) => {
    try {
      const response = await staffService.getOrderById(order.orderCode);
      const detail = response.data || response;
      handlePrintSlip(order, detail);
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return styles.statusPending;
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'SHIPPING': return styles.statusShipping;
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
        <h1 className={styles.title}>Xử lý đơn hàng</h1>
        <button className={styles.refreshBtn} onClick={handleRefresh}>
          Làm mới
        </button>
      </div>

      {/* Tab Filters */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
            <span className={styles.tabCount}>{tabCounts[tab.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingOverlay}>
            <Loading />
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><HiOutlineCube /></div>
            <h3>Không có đơn hàng nào</h3>
            <p>Hiện tại không có đơn hàng {STATUS_LABELS[activeTab]?.toLowerCase()}</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
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
                        <div className={styles.customerInfo}>
                          <span className={styles.customerName}>
                            {order.shippingName || order.user?.fullName || 'N/A'}
                          </span>
                          <span className={styles.customerPhone}>
                            {order.shippingPhone || order.user?.phone || ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.amount}>
                          {formatCurrency(order.totalAmount || 0)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.paymentMethod}>
                          {order.paymentMethod || 'COD'}
                        </span>
                      </td>
                      <td>
                        <span className={styles.date}>
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${styles.detailBtn}`}
                            onClick={() => handleToggleExpand(order.orderCode, order.id)}
                          >
                            {expandedOrder === order.id ? 'Thu gọn' : 'Chi tiết'}
                          </button>
                          {order.status === 'PENDING' && (
                            <button
                              className={`${styles.actionBtn} ${styles.confirmBtn}`}
                              onClick={() => handleConfirmOrder(order.orderCode, order.id)}
                              disabled={actionLoading === order.id}
                            >
                              {actionLoading === order.id ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <>
                              <button
                                className={`${styles.actionBtn} ${styles.shipBtn}`}
                                onClick={() => handleShipOrder(order.orderCode, order.id)}
                                disabled={actionLoading === order.id}
                              >
                                {actionLoading === order.id ? 'Đang xử lý...' : 'Giao hàng'}
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.printBtn}`}
                                onClick={() => handlePrintOrder(order)}
                              >
                                In phiếu
                              </button>
                            </>
                          )}
                          {order.status === 'SHIPPING' && (
                            <button
                              className={`${styles.actionBtn} ${styles.printBtn}`}
                              onClick={() => handlePrintOrder(order)}
                            >
                              In phiếu
                            </button>
                          )}
                        </div>
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
                                      {expandedDetail.shippingName || expandedDetail.user?.fullName}
                                      <br />
                                      {expandedDetail.shippingPhone || expandedDetail.user?.phone}
                                      <br />
                                      {expandedDetail.shippingAddress || 'Không có địa chỉ'}
                                    </p>
                                  </div>
                                  <div className={styles.detailSection}>
                                    <h4>Thông tin thanh toán</h4>
                                    <p>
                                      Phương thức: {expandedDetail.paymentMethod || 'COD'}
                                      <br />
                                      Tạm tính: {formatCurrency(expandedDetail.subtotal || 0)}
                                      <br />
                                      Phí ship: {formatCurrency(expandedDetail.shippingFee || 0)}
                                      <br />
                                      Giảm giá: -{formatCurrency(expandedDetail.discount || 0)}
                                      <br />
                                      <strong>
                                        Tổng: {formatCurrency(expandedDetail.totalAmount || 0)}
                                      </strong>
                                    </p>
                                  </div>
                                </div>

                                {expandedDetail.note && (
                                  <div className={styles.detailSection} style={{ marginBottom: 16 }}>
                                    <h4>Ghi chú</h4>
                                    <p>{expandedDetail.note}</p>
                                  </div>
                                )}

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

export default StaffOrders;
