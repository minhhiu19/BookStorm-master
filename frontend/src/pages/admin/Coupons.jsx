import React, { useState, useEffect, useCallback } from 'react';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminService from '../../services/adminService';
import styles from './Coupons.module.css';

const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const EMPTY_COUPON = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '',
  startDate: '',
  endDate: '',
  active: true,
};

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_COUPON });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getCoupons(page, 20);
      const data = res.data || res;
      setCoupons(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openAddForm = () => {
    setEditingCoupon(null);
    setForm({ ...EMPTY_COUPON });
    setShowForm(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue || '',
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      startDate: coupon.startDate ? coupon.startDate.slice(0, 10) : '',
      endDate: coupon.endDate ? coupon.endDate.slice(0, 10) : '',
      active: coupon.active !== false,
    });
    setShowForm(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    if (!form.discountValue) {
      toast.error('Vui lòng nhập giá trị giảm');
      return;
    }

    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    try {
      setSaving(true);
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon.id, payload);
        toast.success('Cập nhật mã giảm giá thành công');
      } else {
        await adminService.createCoupon(payload);
        toast.success('Tạo mã giảm giá thành công');
      }
      setShowForm(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deleteCoupon(deleteTarget.id);
      toast.success('Đã xóa mã giảm giá');
      setDeleteTarget(null);
      fetchCoupons();
    } catch (error) {
      toast.error('Không thể xóa mã giảm giá');
    } finally {
      setDeleting(false);
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

  const getCouponStatus = (coupon) => {
    if (coupon.active === false) return { label: 'Ngừng hoạt động', className: 'badgeInactive' };
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) return { label: 'Hết hạn', className: 'badgeExpired' };
    return { label: 'Hoạt động', className: 'badgeActive' };
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Quản lý khuyến mãi</h1>
        <button className={styles.addBtn} onClick={openAddForm}>
          <HiPlus /> Tạo mã giảm giá
        </button>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Đang tải...
          </div>
        ) : coupons.length === 0 ? (
          <div className={styles.emptyState}>Chưa có mã giảm giá nào</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Loại giảm giá</th>
                    <th>Giá trị</th>
                    <th>Đơn tối thiểu</th>
                    <th>Giảm tối đa</th>
                    <th>Đã dùng/Giới hạn</th>
                    <th>Thời hạn</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <tr key={coupon.id}>
                        <td>
                          <span className={styles.couponCode}>{coupon.code}</span>
                        </td>
                        <td>{coupon.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}</td>
                        <td style={{ fontWeight: 500 }}>
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}%`
                            : formatVND(coupon.discountValue || 0)}
                        </td>
                        <td>{coupon.minOrderAmount ? formatVND(coupon.minOrderAmount) : '---'}</td>
                        <td>{coupon.maxDiscount ? formatVND(coupon.maxDiscount) : '---'}</td>
                        <td>
                          <span className={styles.usageCount}>
                            {coupon.usedCount || 0}/{coupon.usageLimit || '---'}
                          </span>
                        </td>
                        <td>
                          {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles[status.className]}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.actionBtn} onClick={() => openEditForm(coupon)} title="Sửa">
                              <HiPencil />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              onClick={() => setDeleteTarget(coupon)}
                              title="Xóa"
                            >
                              <HiTrash />
                            </button>
                          </div>
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingCoupon ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá'}
              </h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mã giảm giá *</label>
                <input
                  className={styles.formInput}
                  value={form.code}
                  onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                  placeholder="VD: SALE50"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Loại giảm giá *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="discountType"
                      value="PERCENTAGE"
                      checked={form.discountType === 'PERCENTAGE'}
                      onChange={(e) => handleFormChange('discountType', e.target.value)}
                    />
                    Phần trăm (%)
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="discountType"
                      value="FIXED"
                      checked={form.discountType === 'FIXED'}
                      onChange={(e) => handleFormChange('discountType', e.target.value)}
                    />
                    Số tiền cố định (VND)
                  </label>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Giá trị giảm * {form.discountType === 'PERCENTAGE' ? '(%)' : '(VND)'}
                  </label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => handleFormChange('discountValue', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Đơn tối thiểu (VND)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => handleFormChange('minOrderAmount', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Giảm tối đa (VND)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => handleFormChange('maxDiscount', e.target.value)}
                    placeholder="Không giới hạn"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Giới hạn sử dụng</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => handleFormChange('usageLimit', e.target.value)}
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ngày bắt đầu</label>
                  <input
                    className={styles.formInput}
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ngày kết thúc</label>
                  <input
                    className={styles.formInput}
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>
                Hủy
              </button>
              <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Đang lưu...' : editingCoupon ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={`${styles.modal} ${styles.confirmModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Xác nhận xóa</h2>
              <button className={styles.modalClose} onClick={() => setDeleteTarget(null)}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                Bạn có chắc chắn muốn xóa mã <strong>{deleteTarget.code}</strong>?
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

export default Coupons;
