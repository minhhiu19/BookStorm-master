import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookService from '../services/bookService';
import categoryService from '../services/categoryService';
import BookCard from '../components/common/BookCard';
import styles from './Shop.module.css';

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Mới nhất' },
  { value: 'basePrice,asc', label: 'Giá tăng dần' },
  { value: 'basePrice,desc', label: 'Giá giảm dần' },
  { value: 'soldCount,desc', label: 'Bán chạy' },
];

const PUBLISH_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

const PAGE_SIZE = 12;

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter state from URL
  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const currentSort = searchParams.get('sort') || 'createdAt,desc';
  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
  const authorFilter = searchParams.get('author') || '';
  const publisherFilter = searchParams.get('publisher') || '';
  const publishYearFilter = searchParams.get('publishYear') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Local state for text inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localAuthor, setLocalAuthor] = useState(authorFilter);
  const [localPublisher, setLocalPublisher] = useState(publisherFilter);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getRootCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedCategories.length) filters.categoryId = selectedCategories.join(',');
      if (authorFilter) filters.author = authorFilter;
      if (publisherFilter) filters.publisher = publisherFilter;
      if (publishYearFilter) filters.publishYear = publishYearFilter;
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;

      const hasFilters = Object.keys(filters).length > 0;
      let res;

      if (hasFilters) {
        res = await bookService.filterBooks(filters, currentPage, PAGE_SIZE, currentSort);
      } else {
        res = await bookService.getBooks(currentPage, PAGE_SIZE, currentSort);
      }

      const data = res.data;
      if (data?.content) {
        setBooks(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setBooks(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setBooks([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
      toast.error('Không thể tải danh sách sách');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSort, selectedCategories.join(','), authorFilter, publisherFilter, publishYearFilter, minPrice, maxPrice]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Sync local state with URL params
  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalAuthor(authorFilter);
    setLocalPublisher(publisherFilter);
  }, [searchParams]);

  const updateSearchParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.length > 0) {
        params.set(key, Array.isArray(value) ? value.join(',') : value);
      } else {
        params.delete(key);
      }
    });
    params.set('page', '0');
    setSearchParams(params);
  };

  // Instant filter toggle for category
  const handleToggleFilter = (filterKey, currentValues, item) => {
    const newValues = currentValues.includes(item)
      ? currentValues.filter((i) => i !== item)
      : [...currentValues, item];
    updateSearchParams({ [filterKey]: newValues });
  };

  // Author filter with debounce via onChange
  const handleAuthorChange = (e) => {
    setLocalAuthor(e.target.value);
  };

  const handleAuthorApply = () => {
    updateSearchParams({ author: localAuthor });
  };

  // Publisher filter
  const handlePublisherChange = (e) => {
    setLocalPublisher(e.target.value);
  };

  const handlePublisherApply = () => {
    updateSearchParams({ publisher: localPublisher });
  };

  // Publish year filter
  const handlePublishYearChange = (e) => {
    updateSearchParams({ publishYear: e.target.value });
  };

  // Price filter
  const handleApplyPrice = () => {
    updateSearchParams({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
    });
  };

  const handleClearFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalAuthor('');
    setLocalPublisher('');
    setSearchParams({ sort: currentSort });
    setMobileFiltersOpen(false);
  };

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    params.set('page', '0');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    authorFilter ||
    publisherFilter ||
    publishYearFilter ||
    minPrice ||
    maxPrice;

  return (
    <div className={styles.shop}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Trang chủ</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span>Sách</span>
        </nav>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Sách</h1>
          <button
            className={styles.mobileFilterToggle}
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="8" cy="6" r="2" fill="currentColor" />
              <circle cx="16" cy="12" r="2" fill="currentColor" />
              <circle cx="10" cy="18" r="2" fill="currentColor" />
            </svg>
            Bộ lọc
          </button>
        </div>

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={`${styles.sidebar} ${mobileFiltersOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>Bộ lọc</h3>
              <button
                className={styles.sidebarClose}
                onClick={() => setMobileFiltersOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Category Filter */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Danh mục</h4>
              <div className={styles.filterOptions}>
                {categories.length > 0
                  ? categories.map((cat) => (
                      <label key={cat.id} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(String(cat.id))}
                          onChange={() =>
                            handleToggleFilter('category', selectedCategories, String(cat.id))
                          }
                          className={styles.checkbox}
                        />
                        <span className={styles.checkboxCustom} />
                        <span>{cat.name}</span>
                      </label>
                    ))
                  : Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={styles.filterSkeleton} />
                    ))}
              </div>
            </div>

            {/* Author Filter */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Tác giả</h4>
              <div className={styles.priceInputs}>
                <input
                  type="text"
                  placeholder="Nhập tên tác giả"
                  value={localAuthor}
                  onChange={handleAuthorChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuthorApply()}
                  className={styles.priceInput}
                  style={{ flex: 1 }}
                />
              </div>
              <button className={styles.priceApplyBtn} onClick={handleAuthorApply}>
                Lọc tác giả
              </button>
            </div>

            {/* Publisher Filter */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Nhà xuất bản</h4>
              <div className={styles.priceInputs}>
                <input
                  type="text"
                  placeholder="Nhập nhà xuất bản"
                  value={localPublisher}
                  onChange={handlePublisherChange}
                  onKeyDown={(e) => e.key === 'Enter' && handlePublisherApply()}
                  className={styles.priceInput}
                  style={{ flex: 1 }}
                />
              </div>
              <button className={styles.priceApplyBtn} onClick={handlePublisherApply}>
                Lọc NXB
              </button>
            </div>

            {/* Publish Year Filter */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Năm xuất bản</h4>
              <select
                value={publishYearFilter}
                onChange={handlePublishYearChange}
                className={styles.priceInput}
                style={{ width: '100%', padding: '8px 12px' }}
              >
                <option value="">Tất cả</option>
                {PUBLISH_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Giá</h4>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Từ"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}
                  className={styles.priceInput}
                />
                <span className={styles.priceSep}>-</span>
                <input
                  type="number"
                  placeholder="Đến"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}
                  className={styles.priceInput}
                />
              </div>
              <button className={styles.priceApplyBtn} onClick={handleApplyPrice}>
                Lọc giá
              </button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className={styles.filterActions}>
                <button className={styles.clearButton} onClick={handleClearFilters}>
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </aside>

          {/* Mobile overlay */}
          {mobileFiltersOpen && (
            <div
              className={styles.sidebarOverlay}
              onClick={() => setMobileFiltersOpen(false)}
            />
          )}

          {/* Content */}
          <main className={styles.content}>
            {/* Top Bar */}
            <div className={styles.topBar}>
              <span className={styles.resultCount}>
                {loading ? '...' : `${totalElements} cuốn sách`}
              </span>
              <select
                value={currentSort}
                onChange={handleSortChange}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Grid */}
            {loading ? (
              <div className={styles.productGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.productSkeleton}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonText} />
                    <div className={styles.skeletonTextShort} />
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Không tìm thấy cuốn sách nào.</p>
                {hasActiveFilters && (
                  <button className={styles.clearButton} onClick={handleClearFilters}>
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.productGrid}>
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                  <button
                    key={page}
                    className={`${styles.pageButton} ${
                      page === currentPage ? styles.pageButtonActive : ''
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  className={styles.pageButton}
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Shop;
