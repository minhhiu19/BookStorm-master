import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import staffService from '../../services/staffService';
import Loading from '../../components/common/Loading';
import styles from './StaffProductEdit.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const StaffProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [book, setBook] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    salePrice: '',
    author: '',
    publisher: '',
    isbn: '',
    publishYear: '',
    pageCount: '',
    stockQuantity: '',
  });

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await staffService.getBookById(id);
      const bookData = response.data || response;
      setBook(bookData);
      setFormData({
        name: bookData.name || '',
        description: bookData.description || '',
        basePrice: bookData.basePrice || '',
        salePrice: bookData.salePrice || '',
        author: bookData.author || '',
        publisher: bookData.publisher || '',
        isbn: bookData.isbn || '',
        publishYear: bookData.publishYear || '',
        pageCount: bookData.pageCount || '',
        stockQuantity: bookData.stockQuantity ?? '',
      });
    } catch (error) {
      toast.error('Không thể tải thông tin sách');
      console.error('Failed to fetch book:', error);
      navigate('/staff/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Tên sách không được để trống');
      return;
    }
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      toast.error('Giá gốc phải lớn hơn 0');
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        author: formData.author,
        publisher: formData.publisher,
        isbn: formData.isbn,
      };

      if (formData.salePrice && parseFloat(formData.salePrice) > 0) {
        updateData.salePrice = parseFloat(formData.salePrice);
      }

      if (formData.publishYear) {
        updateData.publishYear = parseInt(formData.publishYear, 10);
      }

      if (formData.pageCount) {
        updateData.pageCount = parseInt(formData.pageCount, 10);
      }

      if (formData.stockQuantity !== '') {
        updateData.stockQuantity = parseInt(formData.stockQuantity, 10);
      }

      await staffService.updateBook(id, updateData);
      toast.success('Cập nhật sách thành công');
      navigate('/staff/inventory');
    } catch (error) {
      toast.error('Không thể cập nhật sách');
      console.error('Failed to update book:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <Loading />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <h2>Không tìm thấy sách</h2>
          <Link to="/staff/inventory" className={styles.backLink}>
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Cập nhật sách</h1>
        <Link to="/staff/inventory" className={styles.backBtn}>
          Quay lại
        </Link>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Thông tin cơ bản</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên sách <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              className={styles.input}
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên sách"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mô tả</label>
            <textarea
              name="description"
              className={styles.textarea}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả sách"
              rows={5}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Giá gốc <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                className={styles.input}
                value={formData.basePrice}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Giá sale</label>
              <input
                type="number"
                name="salePrice"
                className={styles.input}
                value={formData.salePrice}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Thông tin sách</h2>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tác giả</label>
              <input
                type="text"
                name="author"
                className={styles.input}
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Nhập tên tác giả"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nhà xuất bản</label>
              <input
                type="text"
                name="publisher"
                className={styles.input}
                value={formData.publisher}
                onChange={handleInputChange}
                placeholder="Nhập tên nhà xuất bản"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>ISBN</label>
              <input
                type="text"
                name="isbn"
                className={styles.input}
                value={formData.isbn}
                onChange={handleInputChange}
                placeholder="Nhập mã ISBN"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Năm xuất bản</label>
              <input
                type="number"
                name="publishYear"
                className={styles.input}
                value={formData.publishYear}
                onChange={handleInputChange}
                placeholder="VD: 2024"
                min="1900"
                max="2100"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Số trang</label>
              <input
                type="number"
                name="pageCount"
                className={styles.input}
                value={formData.pageCount}
                onChange={handleInputChange}
                placeholder="Nhập số trang"
                min="1"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tồn kho</label>
              <input
                type="number"
                name="stockQuantity"
                className={styles.input}
                value={formData.stockQuantity}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Thông tin chỉ xem</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Danh mục:</span>
              <span className={styles.infoValue}>{book.categoryName || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nổi bật:</span>
              <span className={styles.infoValue}>
                {book.featured ? 'Có' : 'Không'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Trạng thái:</span>
              <span className={styles.infoValue}>
                {book.active ? 'Đang bán' : 'Ngừng bán'}
              </span>
            </div>
          </div>
          <p className={styles.infoNote}>
            Lưu ý: Nhân viên chỉ có thể chỉnh sửa thông tin cơ bản. Để thay đổi danh
            mục, trạng thái hoặc tính năng nổi bật, vui lòng liên hệ quản trị viên.
          </p>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate('/staff/inventory')}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffProductEdit;
