import React, { useState, useEffect, useCallback } from 'react';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import styles from './Banners.module.css';

const EMPTY_BANNER = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  active: true,
};

function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_BANNER });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getBanners(0, 50);
      const data = res.data || res;
      const items = data.content || data || [];
      items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setBanners(items);
    } catch (error) {
      toast.error('Không thể tải danh sách banner');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openAddForm = () => {
    setEditingBanner(null);
    setForm({ ...EMPTY_BANNER, sortOrder: banners.length });
    setShowForm(true);
  };

  const openEditForm = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || '',
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      sortOrder: banner.sortOrder ?? 0,
      active: banner.active !== false,
    });
    setShowForm(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề banner');
      return;
    }

    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      setSaving(true);
      if (editingBanner) {
        await adminService.updateBanner(editingBanner.id, payload);
        toast.success('Cập nhật banner thành công');
      } else {
        await adminService.createBanner(payload);
        toast.success('Thêm banner thành công');
      }
      setShowForm(false);
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await adminService.toggleBannerActive(banner.id);
      toast.success(banner.active !== false ? 'Đã ẩn banner' : 'Đã hiện banner');
      fetchBanners();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deleteBanner(deleteTarget.id);
      toast.success('Đã xóa banner');
      setDeleteTarget(null);
      fetchBanners();
    } catch (error) {
      toast.error('Không thể xóa banner');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Quản lý banner</h1>
        <button className={styles.addBtn} onClick={openAddForm}>
          <HiPlus /> Thêm banner
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Đang tải...
        </div>
      ) : banners.length === 0 ? (
        <div className={styles.emptyState}>Chưa có banner nào</div>
      ) : (
        <div className={styles.bannerGrid}>
          {banners.map((banner) => (
            <div key={banner.id} className={styles.bannerCard}>
              <div className={styles.bannerImageWrapper}>
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className={styles.bannerImage}
                  />
                ) : (
                  <div className={styles.bannerImagePlaceholder}>
                    {banner.title || 'Banner'}
                  </div>
                )}
                <span className={styles.bannerOrder}>#{banner.sortOrder ?? 0}</span>
              </div>
              <div className={styles.bannerCardBody}>
                <h3 className={styles.bannerCardTitle}>{banner.title || 'Không có tiêu đề'}</h3>
                <p className={styles.bannerCardLink}>{banner.linkUrl || '---'}</p>
                <div className={styles.bannerCardFooter}>
                  <button
                    className={`${styles.toggleSwitch} ${banner.active !== false ? styles.active : ''}`}
                    onClick={() => handleToggleActive(banner)}
                    title={banner.active !== false ? 'Đang hiện' : 'Đang ẩn'}
                  />
                  <div className={styles.bannerActions}>
                    <button className={styles.actionBtn} onClick={() => openEditForm(banner)} title="Sửa">
                      <HiPencil />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                      onClick={() => setDeleteTarget(banner)}
                      title="Xóa"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingBanner ? 'Sửa banner' : 'Thêm banner'}
              </h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tiêu đề *</label>
                <input
                  className={styles.formInput}
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề banner"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>URL hình ảnh</label>
                <input
                  className={styles.formInput}
                  value={form.imageUrl}
                  onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                  placeholder="https://..."
                />
                {form.imageUrl && (
                  <div className={styles.imagePreview}>
                    <img src={form.imageUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
                {!form.imageUrl && (
                  <div className={styles.imagePreview}>
                    <div className={styles.imagePreviewPlaceholder}>Chưa có hình ảnh</div>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Link URL</label>
                <input
                  className={styles.formInput}
                  value={form.linkUrl}
                  onChange={(e) => handleFormChange('linkUrl', e.target.value)}
                  placeholder="VD: /shop?sale=true"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thứ tự hiển thị</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => handleFormChange('sortOrder', e.target.value)}
                    min="0"
                  />
                </div>
                <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                  <div className={styles.formToggle}>
                    <button
                      className={`${styles.toggleSwitch} ${form.active ? styles.active : ''}`}
                      onClick={() => handleFormChange('active', !form.active)}
                      type="button"
                    />
                    <span className={styles.toggleLabel}>Hiển thị banner</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>
                Hủy
              </button>
              <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Đang lưu...' : editingBanner ? 'Cập nhật' : 'Thêm mới'}
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
                Bạn có chắc chắn muốn xóa banner <strong>{deleteTarget.title}</strong>?
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

export default Banners;
