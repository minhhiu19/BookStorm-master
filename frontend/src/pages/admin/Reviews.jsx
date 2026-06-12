import React, { useState, useEffect, useCallback } from 'react';
import { HiTrash, HiX, HiStar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminService from '../../services/adminService';
import styles from './Reviews.module.css';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const visibleParam = filterStatus === '' ? null : filterStatus === 'true';
      const res = await adminService.getReviews(page, 20, visibleParam);
      const data = res.data || res;
      setReviews(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleVisibility = async (review) => {
    try {
      await adminService.toggleReviewVisibility(review.id);
      toast.success('Đã cập nhật trạng thái hiển thị');
      fetchReviews();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deleteReview(deleteTarget.id);
      toast.success('Đã xóa đánh giá');
      setDeleteTarget(null);
      fetchReviews();
    } catch (error) {
      toast.error('Không thể xóa đánh giá');
    } finally {
      setDeleting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <HiStar key={i} className={i < rating ? undefined : styles.starEmpty} />
    ));
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
      <h1 className={styles.pageTitle}>Quản lý đánh giá</h1>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">Tất cả</option>
          <option value="true">Đang hiển thị</option>
          <option value="false">Đang ẩn</option>
        </select>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Đang tải...
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>Không có đánh giá nào</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Rating</th>
                    <th>Nội dung</th>
                    <th>Ngày</th>
                    <th>Hiển thị</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {review.userName || review.user?.fullName || '---'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {review.productName || review.product?.name || '---'}
                      </td>
                      <td>
                        <div className={styles.stars}>{renderStars(review.rating || 0)}</div>
                      </td>
                      <td>
                        <div className={styles.reviewContent}>
                          {review.content || review.comment || '---'}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(review.createdAt)}</td>
                      <td>
                        <button
                          className={`${styles.toggleSwitch} ${
                            review.visible !== false && review.status !== 'REJECTED' ? styles.active : ''
                          }`}
                          onClick={() => handleToggleVisibility(review)}
                          title={review.visible !== false ? 'Đang hiển thị' : 'Đang ẩn'}
                        />
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            onClick={() => setDeleteTarget(review)}
                            title="Xóa"
                          >
                            <HiTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Xác nhận xóa</h2>
              <button className={styles.modalClose} onClick={() => setDeleteTarget(null)}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                Bạn có chắc chắn muốn xóa đánh giá này? Hành động không thể hoàn tác.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setDeleteTarget(null)}>
                Hủy
              </button>
              <button className={styles.btnDanger} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;
