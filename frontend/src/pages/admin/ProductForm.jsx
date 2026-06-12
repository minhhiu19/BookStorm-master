import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPlus, HiTrash, HiUpload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import styles from './ProductForm.module.css';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form state - Book fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  // Images state
  const [existingImages, setExistingImages] = useState([]);
  const [imageUrls, setImageUrls] = useState(['']);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchBook();
    }
  }, [id]); // eslint-disable-line

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories(0, 100);
      const data = res.data || res;
      setCategories(data.content || data || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBookById(id);
      const book = res.data || res;

      setName(book.name || '');
      setDescription(book.description || '');
      setCategoryId(book.categoryId || '');
      setAuthor(book.author || '');
      setPublisher(book.publisher || '');
      setIsbn(book.isbn || '');
      setPublishYear(book.publishYear || '');
      setPageCount(book.pageCount || '');
      setBasePrice(book.basePrice || '');
      setSalePrice(book.salePrice || '');
      setStockQuantity(book.stockQuantity ?? '');
      setFeatured(book.featured || false);
      setActive(book.active !== false);

      if (book.images && book.images.length > 0) {
        setExistingImages(
          book.images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            primary: img.primary,
            sortOrder: img.sortOrder,
          }))
        );
      }
    } catch (error) {
      toast.error('Không thể tải thông tin sách');
      navigate('/admin/books');
    } finally {
      setLoading(false);
    }
  };

  // Image URL handlers
  const handleImageUrlChange = (index, value) => {
    setImageUrls((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addImageUrl = () => {
    setImageUrls((prev) => [...prev, '']);
  };

  const removeImageUrl = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Delete existing image
  const handleDeleteExistingImage = async (imageId) => {
    try {
      await adminService.deleteBookImage(id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Đã xóa hình ảnh');
    } catch (error) {
      toast.error('Không thể xóa hình ảnh');
    }
  };

  // File upload handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (isEdit) {
      uploadFiles(files);
    } else {
      setPendingFiles((prev) => [...prev, ...files]);
      toast.success(`Đã thêm ${files.length} file, sẽ upload sau khi tạo sách`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (files) => {
    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      await adminService.uploadBookImages(id, formData);
      toast.success('Upload hình ảnh thành công');
      fetchBook();
    } catch (error) {
      toast.error('Không thể upload hình ảnh');
    } finally {
      setUploading(false);
    }
  };

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên sách');
      return;
    }
    if (!author.trim()) {
      toast.error('Vui lòng nhập tên tác giả');
      return;
    }
    if (!basePrice) {
      toast.error('Vui lòng nhập giá sách');
      return;
    }
    if (stockQuantity === '' || stockQuantity === null) {
      toast.error('Vui lòng nhập số lượng tồn kho');
      return;
    }

    const allImageUrls = [
      ...existingImages.map((img) => img.imageUrl),
      ...imageUrls.filter((url) => url.trim()),
    ];

    const payload = {
      name: name.trim(),
      description: description.trim(),
      categoryId: categoryId ? Number(categoryId) : null,
      author: author.trim(),
      publisher: publisher.trim() || null,
      isbn: isbn.trim() || null,
      publishYear: publishYear ? Number(publishYear) : null,
      pageCount: pageCount ? Number(pageCount) : null,
      basePrice: Number(basePrice),
      salePrice: salePrice ? Number(salePrice) : null,
      stockQuantity: Number(stockQuantity) || 0,
      featured,
      active,
      imageUrls: allImageUrls,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await adminService.updateBook(id, payload);
        toast.success('Cập nhật sách thành công');
      } else {
        const res = await adminService.createBook(payload);
        const created = res.data || res;
        const newId = created.id;
        toast.success('Thêm sách thành công');

        if (pendingFiles.length > 0 && newId) {
          try {
            setUploading(true);
            const formData = new FormData();
            pendingFiles.forEach((file) => formData.append('files', file));
            await adminService.uploadBookImages(newId, formData);
            toast.success('Upload hình ảnh thành công');
          } catch (uploadError) {
            toast.error('Tạo sách thành công nhưng upload ảnh thất bại');
          } finally {
            setUploading(false);
          }
        }
      }
      navigate('/admin/books');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/admin/books')}>
          <HiArrowLeft />
        </button>
        <h1 className={styles.pageTitle}>
          {isEdit ? `Sửa sách: ${name}` : 'Thêm sách'}
        </h1>
      </div>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbLink} onClick={() => navigate('/admin/books')}>
          Quản lý sách
        </span>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>
          {isEdit ? 'Sửa sách' : 'Thêm sách'}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.layout}>
          {/* Left Column - Main Info */}
          <div className={styles.mainColumn}>
            {/* Basic Info */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Thông tin cơ bản</h2>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên sách *</label>
                <input
                  className={styles.formInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên sách"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mô tả</label>
                <textarea
                  className={styles.formTextarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả nội dung sách"
                />
              </div>
            </div>

            {/* Book Details */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Thông tin sách</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tác giả *</label>
                  <input
                    className={styles.formInput}
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Tên tác giả"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nhà xuất bản</label>
                  <input
                    className={styles.formInput}
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Tên nhà xuất bản"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>ISBN</label>
                  <input
                    className={styles.formInput}
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="VD: 978-604-..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Năm xuất bản</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={publishYear}
                    onChange={(e) => setPublishYear(e.target.value)}
                    placeholder="VD: 2024"
                    min="1000"
                    max="2100"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số trang</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    placeholder="VD: 320"
                    min="1"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Danh mục</label>
                  <select
                    className={styles.formSelect}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Price & Stock */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Giá & Tồn kho</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Giá gốc *</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Giá giảm</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Để trống nếu không giảm giá"
                    min="0"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số lượng tồn kho *</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nổi bật</label>
                  <div className={styles.formToggle}>
                    <div
                      className={`${styles.toggleSwitch} ${featured ? styles.active : ''}`}
                      onClick={() => setFeatured(!featured)}
                    />
                    <span className={styles.toggleLabel}>
                      {featured ? 'Sách nổi bật' : 'Không nổi bật'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className={styles.sideColumn}>
            {/* Status */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Trạng thái</h2>
              <div className={styles.formToggle}>
                <div
                  className={`${styles.toggleSwitch} ${active ? styles.active : ''}`}
                  onClick={() => setActive(!active)}
                />
                <span className={styles.toggleLabel}>
                  {active ? 'Đang bán' : 'Ngừng bán'}
                </span>
              </div>
            </div>

            {/* Images */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Hình ảnh sách</h2>

              {/* Existing images (edit mode) */}
              {existingImages.length > 0 && (
                <div className={styles.existingImages}>
                  {existingImages.map((img) => (
                    <div key={img.id} className={styles.existingImageItem}>
                      <img src={img.imageUrl} alt="" className={styles.existingImageThumb} />
                      <button
                        type="button"
                        className={styles.imageDeleteBtn}
                        onClick={() => handleDeleteExistingImage(img.id)}
                        title="Xóa hình ảnh"
                      >
                        <HiTrash />
                      </button>
                      {img.primary && (
                        <span className={styles.primaryBadge}>Chính</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* File upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {isEdit ? (
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <HiUpload />
                  {uploading ? 'Đang upload...' : 'Upload hình ảnh'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <HiUpload />
                    Chọn file (upload sau khi tạo)
                  </button>
                  {pendingFiles.length > 0 && (
                    <div className={styles.pendingFiles}>
                      <span className={styles.pendingLabel}>
                        File chờ upload ({pendingFiles.length}):
                      </span>
                      {pendingFiles.map((file, index) => (
                        <div key={index} className={styles.pendingFileItem}>
                          <span className={styles.pendingFileName}>{file.name}</span>
                          <button
                            type="button"
                            className={styles.pendingFileRemove}
                            onClick={() => removePendingFile(index)}
                          >
                            <HiTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Manual URL input */}
              <div className={styles.urlSection}>
                <span className={styles.urlSectionLabel}>Hoặc nhập URL hình ảnh</span>
                {imageUrls.map((url, index) => (
                  <div key={index} className={styles.imageUrlRow}>
                    <input
                      className={styles.formInput}
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeImageUrl(index)}
                      >
                        <HiTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className={styles.smallBtn} onClick={addImageUrl}>
                  <HiPlus style={{ marginRight: 4 }} /> Thêm URL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => navigate('/admin/books')}
          >
            Hủy
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={saving || uploading}>
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật sách' : 'Tạo sách'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
