import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineCube } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import Loading from '../../components/common/Loading';
import styles from './Inventory.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const LOW_STOCK_THRESHOLD = 10;

const Inventory = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [stats, setStats] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const searchTimerRef = useRef(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getBooks(page, 20, 'createdAt,desc');
      const data = response.data || response;
      const allBooks = data.content || data || [];

      // Build rows from books (book-level stock, not variant-based)
      let rows = allBooks.map((book) => {
        const bookImage = book.images && book.images.length > 0
          ? book.images[0].imageUrl
          : null;
        return {
          bookId: book.id,
          bookName: book.name,
          bookImage,
          author: book.author || '-',
          stock: book.stockQuantity ?? 0,
          price: book.basePrice || 0,
        };
      });

      // Stats
      const lowStock = rows.filter((r) => r.stock > 0 && r.stock < LOW_STOCK_THRESHOLD).length;
      const outOfStock = rows.filter((r) => r.stock === 0).length;
      const inStock = rows.filter((r) => r.stock >= LOW_STOCK_THRESHOLD).length;
      setStats({ total: rows.length, inStock, lowStock, outOfStock });

      // Apply filters
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.bookName?.toLowerCase().includes(q) ||
            r.author?.toLowerCase().includes(q)
        );
      }
      if (showLowStockOnly) {
        rows = rows.filter((r) => r.stock < LOW_STOCK_THRESHOLD);
      }

      setBooks(rows);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách tồn kho');
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, showLowStockOnly]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    for (let i = start; i < end; i++) pages.push(i);

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
        <h1 className={styles.title}>Quản lý kho hàng</h1>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={fetchBooks}>
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng đầu sách</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Còn hàng</div>
          <div className={`${styles.statValue} ${styles.statSuccess}`}>{stats.inStock}</div>
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

      {/* Search */}
      <div className={styles.searchBar}>
        <div className={styles.searchWrapper}>
          <HiOutlineSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm sách, tác giả..."
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

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingOverlay}>
            <Loading />
          </div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><HiOutlineCube /></div>
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
                  <th>Sách</th>
                  <th>Tác giả</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {books.map((row) => (
                  <tr key={row.bookId} className={getRowClass(row.stock)}>
                    <td>
                      <div className={styles.productInfo}>
                        {row.bookImage ? (
                          <img
                            src={row.bookImage}
                            alt={row.bookName}
                            className={styles.productImage}
                          />
                        ) : (
                          <div className={styles.productImagePlaceholder}><HiOutlineCube /></div>
                        )}
                        <span className={styles.productName}>{row.bookName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.variantInfo}>{row.author}</span>
                    </td>
                    <td>
                      <span className={styles.priceText}>{formatCurrency(row.price)}</span>
                    </td>
                    <td>
                      <div className={styles.stockDisplay}>
                        <span className={`${styles.stockValue} ${getStockClass(row.stock)}`}>
                          {row.stock}
                        </span>
                        {row.stock === 0 && (
                          <span className={`${styles.stockBadge} ${styles.badgeOut}`}>
                            Hết hàng
                          </span>
                        )}
                        {row.stock > 0 && row.stock < LOW_STOCK_THRESHOLD && (
                          <span className={`${styles.stockBadge} ${styles.badgeLow}`}>
                            Sắp hết
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          to={`/admin/books/${row.bookId}/edit`}
                          className={styles.editLinkBtn}
                        >
                          Chỉnh sửa
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;
