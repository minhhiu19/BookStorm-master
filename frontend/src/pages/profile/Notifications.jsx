import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineBell,
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';
import styles from './Notifications.module.css';

const ICON_MAP = {
  ORDER: HiOutlineShoppingBag,
  SHIPPING: HiOutlineTruck,
  PROMOTION: HiOutlineTag,
  SYSTEM: HiOutlineBell,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(page, 20);
      const data = response.data || response;
      setNotifications(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch {
      toast.error('Không thể cập nhật thông báo');
    }
  };

  const handleToggleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silent
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.headerRow}>
        <h2 className={styles.contentTitle}>
          Thông báo
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount}</span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
            <HiOutlineCheckCircle />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <HiOutlineBell className={styles.emptyIcon} />
          <p>Không có thông báo nào</p>
        </div>
      ) : (
        <div className={styles.notificationList}>
          {notifications.map((notif) => {
            const Icon = ICON_MAP[notif.type] || HiOutlineBell;
            const timeAgo = notif.createdAt
              ? formatDistanceToNow(new Date(notif.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })
              : '';

            return (
              <div
                key={notif.id}
                className={`${styles.notifCard} ${
                  !notif.isRead ? styles.notifUnread : ''
                }`}
                onClick={() => handleToggleRead(notif.id)}
              >
                <div className={styles.notifIcon}>
                  <Icon />
                </div>
                <div className={styles.notifContent}>
                  <h3 className={styles.notifTitle}>{notif.title}</h3>
                  <p className={styles.notifMessage}>{notif.message}</p>
                  <span className={styles.notifTime}>{timeAgo}</span>
                </div>
                {!notif.isRead && <div className={styles.unreadDot} />}
              </div>
            );
          })}
        </div>
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
    </motion.div>
  );
};

export default Notifications;
