import React, { useState, useEffect, useCallback } from 'react';
import { HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import staffService from '../../services/staffService';
import styles from './StaffReturns.module.css';

const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const STATUS_TABS = [
  { key: '', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xử lý' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Đã từ chối' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
];

const STATUS_MAP = {
  PENDING: { label: 'Chờ xử lý', className: 'badgePending' },
  APPROVED: { label: 'Đã duyệt', className: 'badgeApproved' },
  REJECTED: { label: 'Đã từ chối', className: 'badgeRejected' },
  COMPLETED: { label: 'Hoàn thành', className: 'badgeCompleted' },
};

function StaffReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('');

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [processNote, setProcessNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await staffService.getReturnRequests(page, 20, activeTab || null);
      const data = res.data || res;
      setReturns(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách đổi/trả');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(0);
  };

  const openProcessModal = (returnItem) => {
    setSelectedReturn(returnItem);
    setRefundAmount(returnItem.refundAmount || returnItem.totalAmount || '');
    setProcessNote('');
  };

  const closeModal = () => {
    setSelectedReturn(null);
  };

  const handleProcess = async (status) => {
    if (!selectedReturn) return;
    try {
      setProcessing(true);
      const approved = status === 'APPROVED';
      const amount = approved ? (parseFloat(refundAmount) || 0) : 0;
      await staffService.processReturn(selectedReturn.id, approved, amount);
      toast.success(approved ? 'Đã duyệt yêu cầu đổi/trả' : 'Đã từ chối yêu cầu');
      closeModal();
      fetchReturns();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Quản lý đổi/trả</h1>

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
        ) : returns.length === 0 ? (
          <div className={styles.emptyState}>Không có yêu cầu đổi/trả nào</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Lý do</th>
                    <th>Tiền hoàn</th>
                    <th>Ngày yêu cầu</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((item) => {
                    const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.PENDING;
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>
                          {item.orderCode || `#${item.orderId || item.id}`}
                        </td>
                        <td>{item.userName || item.customerName || '---'}</td>
                        <td>
                          <span className={styles.reason} title={item.reason}>
                            {item.reason || '---'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {formatVND(item.refundAmount || item.totalAmount || 0)}
                        </td>
                        <td>{formatDate(item.createdAt)}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[statusInfo.className]}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>
                          <button className={styles.viewBtn} onClick={() => openProcessModal(item)}>
                            {item.status === 'PENDING' ? 'Xử lý' : 'Chi tiết'}
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

      {/* Process Modal */}
      {selectedReturn && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Yêu cầu đổi/trả - {selectedReturn.orderCode || `#${selectedReturn.orderId || selectedReturn.id}`}
              </h2>
              <button className={styles.modalClose} onClick={closeModal}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Return Details */}
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Khách hàng</span>
                  <span className={styles.detailValue}>
                    {selectedReturn.userName || selectedReturn.customerName || '---'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Ngày yêu cầu</span>
                  <span className={styles.detailValue}>{formatDate(selectedReturn.createdAt)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Trạng thái</span>
                  <span className={styles.detailValue}>
                    <span
                      className={`${styles.badge} ${
                        styles[STATUS_MAP[selectedReturn.status]?.className || 'badgePending']
                      }`}
                    >
                      {STATUS_MAP[selectedReturn.status]?.label || selectedReturn.status}
                    </span>
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Tiền hoàn</span>
                  <span className={styles.detailValue}>
                    {formatVND(selectedReturn.refundAmount || selectedReturn.totalAmount || 0)}
                  </span>
                </div>
              </div>

              <div className={styles.reasonFull}>
                <div className={styles.reasonFullLabel}>Lý do</div>
                <div className={styles.reasonFullText}>
                  {selectedReturn.reason || 'Không có lý do cụ thể'}
                </div>
              </div>

              {/* Process Form - only for PENDING */}
              {selectedReturn.status === 'PENDING' && (
                <div className={styles.processSection}>
                  <h3 className={styles.processSectionTitle}>Xử lý yêu cầu</h3>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số tiền hoàn (VND)</label>
                    <input
                      className={styles.formInput}
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ghi chú</label>
                    <textarea
                      className={styles.formTextarea}
                      value={processNote}
                      onChange={(e) => setProcessNote(e.target.value)}
                      placeholder="Ghi chú xử lý..."
                    />
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      className={styles.btnApprove}
                      onClick={() => handleProcess('APPROVED')}
                      disabled={processing}
                    >
                      {processing ? 'Đang xử lý...' : 'Duyệt yêu cầu'}
                    </button>
                    <button
                      className={styles.btnReject}
                      onClick={() => handleProcess('REJECTED')}
                      disabled={processing}
                    >
                      {processing ? 'Đang xử lý...' : 'Từ chối'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {selectedReturn.status !== 'PENDING' && (
              <div className={styles.modalFooter}>
                <button className={styles.btnSecondary} onClick={closeModal}>
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffReturns;
