import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineMail } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminService from '../../services/adminService';
import Loading from '../../components/common/Loading';
import styles from './ContactMessages.module.css';

const STATUS_MAP = {
  NEW: { label: 'Mới', className: styles.badgeNew },
  READ: { label: 'Đã đọc', className: styles.badgeRead },
  REPLIED: { label: 'Đã phản hồi', className: styles.badgeReplied },
};

function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getContactMessages(page, 20, statusFilter);
      const data = response.data || response;
      setMessages(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải tin nhắn liên hệ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleViewMessage = async (msg) => {
    setSelectedMessage(msg);
    if (msg.status === 'NEW') {
      try {
        await adminService.updateContactMessageStatus(msg.id, 'READ');
        fetchMessages();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateContactMessageStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
    try {
      await adminService.deleteContactMessage(id);
      toast.success('Đã xóa tin nhắn');
      if (selectedMessage?.id === id) setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      toast.error('Không thể xóa tin nhắn');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    for (let i = start; i < end; i++) pages.push(i);

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
        <h1 className={styles.title}>Tin nhắn liên hệ</h1>
      </div>

      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="NEW">Mới</option>
          <option value="READ">Đã đọc</option>
          <option value="REPLIED">Đã phản hồi</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingOverlay}>
            <Loading />
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><HiOutlineMail /></div>
            <h3>Không có tin nhắn</h3>
            <p>Chưa có tin nhắn liên hệ nào.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Người gửi</th>
                  <th>Email</th>
                  <th>Chủ đề</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th>
                  <th>Ngày gửi</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => {
                  const statusInfo = STATUS_MAP[msg.status] || STATUS_MAP.NEW;
                  return (
                    <tr key={msg.id}>
                      <td>
                        <strong>{msg.name}</strong>
                      </td>
                      <td>
                        <span className={styles.emailText}>{msg.email}</span>
                      </td>
                      <td>
                        <span className={styles.subjectText}>{msg.subject}</span>
                      </td>
                      <td>
                        <span className={styles.messageText}>{msg.message}</span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <span className={styles.dateText}>{formatDate(msg.createdAt)}</span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleViewMessage(msg)}
                          >
                            Xem
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(msg.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {renderPagination()}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMessage && (
        <div className={styles.modalOverlay} onClick={() => setSelectedMessage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi tiết tin nhắn</h2>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setSelectedMessage(null)}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Người gửi:</span>
                <span className={styles.detailValue}>{selectedMessage.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email:</span>
                <span className={styles.detailValue}>{selectedMessage.email}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Chủ đề:</span>
                <span className={styles.detailValue}>{selectedMessage.subject}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ngày gửi:</span>
                <span className={styles.detailValue}>{formatDate(selectedMessage.createdAt)}</span>
              </div>
              <div className={styles.messageBody}>
                {selectedMessage.message}
              </div>
            </div>
            <div className={styles.modalFooter}>
              {selectedMessage.status !== 'REPLIED' && (
                <button
                  className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'REPLIED')}
                >
                  Đánh dấu đã phản hồi
                </button>
              )}
              <button
                className={styles.modalBtn}
                onClick={() => setSelectedMessage(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactMessages;
