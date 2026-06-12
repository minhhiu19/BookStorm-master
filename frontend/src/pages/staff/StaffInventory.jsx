import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineBookOpen } from 'react-icons/hi';
import toast from 'react-hot-toast';
import staffService from '../../services/staffService';
import Loading from '../../components/common/Loading';
import styles from './StaffInventory.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const LOW_STOCK_THRESHOLD = 10;

const StaffInventory = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0 });
  const searchTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [search]);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await staffService.getBooks(page, 20, 'createdAt,desc');
      const data = response.data || response;
      let allBooks = data.content || data || [];

      // Calculate stats
      const lowStock = allBooks.filter(
        (b) => b.stockQuantity > 0 && b.stockQuantity < LOW_STOCK_THRESHOLD
      ).length;
      const outOfStock = allBooks.filter((b) => (b.stockQuantity ?? 0) === 0).length;
      setStats({
        total: allBooks.length,
        lowStock,
        outOfStock,
      });

      // Apply search filter client-side
      let filtered = allBooks;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        filtered = allBooks.filter(
          (b) =>
            b.name?.toLowerCase().includes(q) ||
            b.author?.toLowerCase().includes(q) ||
            b.isbn?.toLowerCase().includes(q) ||
            b.publisher?.toLowerCase().includes(q)
        );
      }

      // Apply low stock filter
      if (showLowStockOnly) {
        filtered = filtered.filter((b) => (b.stockQuantity ?? 0) < LOW_STOCK_THRESHOLD);
      }

      setBooks(filtered);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || filtered.length);
    } catch (error) {
      toast.error('Không thể tải danh sách sách');
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, showLowStockOnly]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleStartEdit = (book) => {
    setEditingId(book.id);
    setEditValue(String(book.stockQuantity ?? 0));
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveStock = async (book) => {
    const newStock = parseInt(editValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Số lượng không hợp lệ');
      return;
    }

    if (newStock === (book.stockQuantity ?? 0)) {
      handleCancelEdit();
      return;
    }

    try {
      setSaving(true);
      await staffService.updateBook(book.id, { stockQuantity: newStock });
      toast.success(`Cập nhật tồn kho: ${book.name} -> ${newStock}`);
      handleCancelEdit();
      fetchBooks();
    } catch (error) {
      toast.error('Không thể cập nhật tồn kho');
      console.error('Failed to update stock:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e, book) => {
    if (e.key === 'Enter') {
      handleSaveStock(book);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const getRowClass = (stock) => {
    if (stock === 0) return styles.outOfStockRow;
    if (stock < LOW_STOCK_THRESHOLD) return styles.lowStockRow;
    return '';
  };

  const getStockClass = (stock) => {
    if (stock === 0) return styles.stockOut;
    if (stock < LOW_STOCK_THRESHOLD) return styles.stockLow;
    return styles.stockNormal;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

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
        <h1 className={styles.title}>Quản lý kho sách</h1>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={fetchBooks}>
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng sách</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Sắp hết hàng</div>
          <div className={`${styles.statValue} ${styles.statWarning}`}>{stats.lowStock}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Hết hàng</div>
          <div className={`${styles.statValue} ${styles.statDanger}`}>{stats.outOfStock}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchWrapper}>
          <HiOutlineSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm tên sách, tác giả, ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`${styles.filterToggle} ${showLowStockOnly ? styles.filterActive : ''}`}
          onClick={() => {
            setShowLowStockOnly((prev) => !prev);
            setPage(0);
          }}
        >
          {showLowStockOnly ? 'Tất cả' : 'Chỉ tồn kho thấp'}
        </button>
      </div>

      {/* Inventory Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingOverlay}>
            <Loading />
          </div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><HiOutlineBookOpen /></div>
            <h3>Không tìm thấy sách</h3>
            <p>
              {debouncedSearch
                ? `Không có sách nào phù hợp với "${debouncedSearch}"`
                : 'Hiện tại chưa có sách nào trong hệ thống'}
            </p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên sách</th>
                  <th>Tác giả</th>
                  <th>ISBN</th>
                  <th>Tồn kho</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const stock = book.stockQuantity ?? 0;
                  const isEditing = editingId === book.id;

                  return (
                    <tr key={book.id} className={getRowClass(stock)}>
                      <td>
                        <div className={styles.productInfo}>
                          {book.images && book.images.length > 0 ? (
                            <img
                              src={book.images[0].imageUrl}
                              alt={book.name}
                              className={styles.productImage}
                            />
                          ) : (
                            <div className={styles.productImagePlaceholder}><HiOutlineBookOpen /></div>
                          )}
                          <span className={styles.productName}>{book.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.variantInfo}>{book.author || '-'}</span>
                      </td>
                      <td>
                        <span className={styles.sku}>{book.isbn || '-'}</span>
                      </td>
                      <td>
                        {isEditing ? (
                          <div className={styles.stockEdit}>
                            <input
                              ref={inputRef}
                              type="number"
                              min="0"
                              className={styles.stockInput}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, book)}
                              disabled={saving}
                            />
                            <button
                              className={styles.saveBtn}
                              onClick={() => handleSaveStock(book)}
                              disabled={saving}
                            >
                              {saving ? '...' : 'Lưu'}
                            </button>
                            <button
                              className={styles.cancelBtn}
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <div className={styles.stockDisplay}>
                            <span className={`${styles.stockValue} ${getStockClass(stock)}`}>
                              {stock}
                            </span>
                            {stock === 0 && (
                              <span className={`${styles.stockBadge} ${styles.badgeOut}`}>
                                Hết hàng
                              </span>
                            )}
                            {stock > 0 && stock < LOW_STOCK_THRESHOLD && (
                              <span className={`${styles.stockBadge} ${styles.badgeLow}`}>
                                Sắp hết
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {!isEditing && (
                          <div className={styles.actions}>
                            <button
                              className={styles.editBtn}
                              onClick={() => handleStartEdit(book)}
                            >
                              Cập nhật
                            </button>
                            <Link
                              to={`/staff/books/${book.id}/edit`}
                              className={styles.editLinkBtn}
                            >
                              Sửa sách
                            </Link>
                          </div>
                        )}
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
    </div>
  );
};

export default StaffInventory;
