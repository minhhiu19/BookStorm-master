import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HiPlus, HiPencil, HiTrash, HiX, HiUpload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import styles from './Categories.module.css';

const EMPTY_CATEGORY = {
  name: '',
  description: '',
  imageUrl: '',
  parentCategoryId: '',
  active: true,
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_CATEGORY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getCategories(0, 100);
      const data = res.data || res;
      setCategories(data.content || data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAddForm = () => {
    setEditingCategory(null);
    setForm({ ...EMPTY_CATEGORY });
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      parentCategoryId: category.parentCategoryId || '',
      active: category.active !== false,
    });
    setShowForm(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!editingCategory) {
      toast.error('Vui lòng tạo danh mục trước, sau đó sửa để upload ảnh');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminService.uploadCategoryImage(editingCategory.id, formData);
      const data = res.data || res;
      const newImageUrl = data.imageUrl || form.imageUrl;
      setForm((prev) => ({ ...prev, imageUrl: newImageUrl }));
      toast.success('Upload ảnh thành công');
      fetchCategories();
    } catch (error) {
      toast.error('Upload ảnh thất bại');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl || null,
      parentCategoryId: form.parentCategoryId ? Number(form.parentCategoryId) : null,
      active: form.active,
    };

    try {
      setSaving(true);
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, payload);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await adminService.createCategory(payload);
        toast.success('Thêm danh mục thành công');
      }
      setShowForm(false);
      fetchCategories();
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
      await adminService.deleteCategory(deleteTarget.id);
      toast.success('Đã xóa danh mục');
      setDeleteTarget(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa danh mục');
    } finally {
      setDeleting(false);
    }
  };

  const getParentName = (category) => {
    if (!category.parentCategoryId) return '---';
    const parent = categories.find((c) => c.id === category.parentCategoryId);
    return parent?.name || category.parentCategoryName || '---';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Quản lý danh mục</h1>
        <button className={styles.addBtn} onClick={openAddForm}>
          <HiPlus /> Thêm danh mục
        </button>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Đang tải...
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>Chưa có danh mục nào</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Slug</th>
                  <th>Danh mục cha</th>
                  <th>Số SP</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt="" className={styles.catImage} />
                      ) : (
                        <div className={styles.catImagePlaceholder}>
                          {cat.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{cat.name}</td>
                    <td><span className={styles.slug}>{cat.slug || '---'}</span></td>
                    <td>{getParentName(cat)}</td>
                    <td>{cat.productCount ?? 0}</td>
                    <td>
                      <span className={`${styles.badge} ${cat.active !== false ? styles.badgeActive : styles.badgeInactive}`}>
                        {cat.active !== false ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => openEditForm(cat)} title="Sửa">
                          <HiPencil />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                          onClick={() => setDeleteTarget(cat)}
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
              </h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên danh mục *</label>
                <input
                  className={styles.formInput}
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mô tả</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Mô tả danh mục"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Hình ảnh</label>
                {form.imageUrl && (
                  <div style={{ marginBottom: 8 }}>
                    <img src={form.imageUrl} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                  </div>
                )}
                {editingCategory ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <HiUpload /> {uploading ? 'Đang upload...' : 'Upload ảnh'}
                    </button>
                    <div style={{ marginTop: 8 }}>
                      <input
                        className={styles.formInput}
                        value={form.imageUrl}
                        onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                        placeholder="Hoặc nhập URL ảnh"
                      />
                    </div>
                  </div>
                ) : (
                  <input
                    className={styles.formInput}
                    value={form.imageUrl}
                    onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                    placeholder="URL hình ảnh (upload ảnh sau khi tạo danh mục)"
                  />
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Danh mục cha</label>
                <select
                  className={styles.formSelect}
                  value={form.parentCategoryId}
                  onChange={(e) => handleFormChange('parentCategoryId', e.target.value)}
                >
                  <option value="">Không có (danh mục gốc)</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.formToggle}>
                  <div
                    className={`${styles.toggleSwitch} ${form.active ? styles.active : ''}`}
                    onClick={() => handleFormChange('active', !form.active)}
                  />
                  <span className={styles.toggleLabel}>Hiển thị danh mục</span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>
                Hủy
              </button>
              <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                Bạn có chắc chắn muốn xóa danh mục <strong>{deleteTarget.name}</strong>? Hành
                động này không thể hoàn tác.
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

export default Categories;
