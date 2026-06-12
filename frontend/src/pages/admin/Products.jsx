import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiX, HiStar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import styles from './Products.module.css';

const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

function Products() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getBooks(page, 20);
      const data = res.data || res;
      setBooks(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách sách');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories(0, 100);
      const data = res.data || res;
      setCategories(data.content || data || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const getFilteredBooks = () => {
    let filtered = books;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q)
      );
    }
    if (filterCategory) {
      filtered = filtered.filter(
        (b) => String(b.categoryId) === filterCategory
      );
    }
    if (filterStatus) {
      filtered = filtered.filter((b) =>
        filterStatus === 'active' ? b.active !== false : b.active === false
      );
    }
    return filtered;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deleteBook(deleteTarget.id);
      toast.success('Đã xóa sách');
      setDeleteTarget(null);
      fetchBooks();
    } catch (error) {
      toast.error('Không thể xóa sách');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    const filtered = getFilteredBooks();
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((b) => b.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getPrimaryImage = (book) => {
    if (!book.images || book.images.length === 0) return null;
    const primary = book.images.find((img) => img.primary);
    const img = primary || book.images[0];
    return img?.imageUrl || null;
  };

  const filtered = getFilteredBooks();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Quản lý sách</h1>
        <button className={styles.addBtn} onClick={() => navigate('/admin/books/new')}>
          <HiPlus /> Thêm sách
        </button>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Tìm kiếm sách, tác giả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>Không tìm thấy sách nào</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selectedIds.length === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Ảnh</th>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((book) => {
                    const thumbUrl = getPrimaryImage(book);
                    return (
                      <tr key={book.id}>
                        <td>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={selectedIds.includes(book.id)}
                            onChange={() => toggleSelect(book.id)}
                          />
                        </td>
                        <td>
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt=""
                              className={styles.productThumb}
                            />
                          ) : (
                            <div className={styles.thumbPlaceholder}>
                              {book.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>
                            <span className={styles.productName}>{book.name}</span>
                            {book.featured && (
                              <HiStar style={{ color: '#e6a817', marginLeft: 4, verticalAlign: 'middle', fontSize: 14 }} />
                            )}
                          </div>
                        </td>
                        <td>{book.author || '---'}</td>
                        <td>{book.categoryName || '---'}</td>
                        <td>
                          {book.salePrice ? (
                            <>
                              <span style={{ color: 'var(--color-error)', fontWeight: 500 }}>
                                {formatVND(book.salePrice)}
                              </span>
                              <br />
                              <span style={{ textDecoration: 'line-through', color: 'var(--color-text-secondary)', fontSize: 12 }}>
                                {formatVND(book.basePrice)}
                              </span>
                            </>
                          ) : (
                            formatVND(book.basePrice || 0)
                          )}
                        </td>
                        <td>{book.stockQuantity || 0}</td>
                        <td>
                          <span className={`${styles.badge} ${book.active !== false ? styles.badgeActive : styles.badgeInactive}`}>
                            {book.active !== false ? 'Đang bán' : 'Ngừng bán'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => navigate(`/admin/books/${book.id}/edit`)}
                              title="Sửa"
                            >
                              <HiPencil />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              onClick={() => setDeleteTarget(book)}
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
                Bạn có chắc chắn muốn xóa sách <strong>{deleteTarget.name}</strong>? Hành động
                này không thể hoàn tác.
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

export default Products;
