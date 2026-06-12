import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import orderService from '../../services/orderService';
import styles from './MyReturns.module.css';

const STATUS_MAP = {
  PENDING: { label: 'Chờ xử lý', className: 'statusPending' },
  APPROVED: { label: 'Đã duyệt', className: 'statusApproved' },
  REJECTED: { label: 'Từ chối', className: 'statusRejected' },
  COMPLETED: { label: 'Hoàn thành', className: 'statusCompleted' },
};

const formatPrice = (price) => {
  if (!price) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const MyReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyReturns(page, 10);
      const data = response.data;
      setReturns(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Không thể tải danh sách yêu cầu đổi/trả');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={styles.contentTitle}>Yêu cầu đổi/trả hàng</h2>

      {loading ? (
        <div className={styles.loadingState}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : returns.length === 0 ? (
        <div className={styles.emptyState}>
          <HiOutlineRefresh className={styles.emptyIcon} />
          <p>Chưa có yêu cầu đổi/trả nào</p>
        </div>
      ) : (
        <div className={styles.returnList}>
          {returns.map((item) => {
            const statusInfo = STATUS_MAP[item.status] || {
              label: item.status,
              className: 'statusPending',
            };
            return (
              <div key={item.id} className={styles.returnCard}>
                <div className={styles.returnHeader}>
                  <div className={styles.returnMeta}>
                    <span className={styles.returnCode}>
                      Đơn hàng #{item.orderCode}
                    </span>
                    <span className={styles.returnDate}>
                      {item.createdAt
                        ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')
                        : ''}
                    </span>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${styles[statusInfo.className]}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <div className={styles.returnBody}>
                  <div className={styles.returnField}>
                    <span className={styles.fieldLabel}>Lý do</span>
                    <span className={styles.fieldValue}>{item.reason}</span>
                  </div>
                  {item.refundAmount && (
                    <div className={styles.returnField}>
                      <span className={styles.fieldLabel}>Số tiền hoàn</span>
                      <span className={styles.fieldValueHighlight}>
                        {formatPrice(item.refundAmount)}
                      </span>
                    </div>
                  )}
                  {item.processedAt && (
                    <div className={styles.returnField}>
                      <span className={styles.fieldLabel}>Ngày xử lý</span>
                      <span className={styles.fieldValue}>
                        {format(new Date(item.processedAt), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
    </motion.div>
  );
};

export default MyReturns;
