import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className={styles.pagination} aria-label="Phân trang">
      <button
        className={`${styles.pageBtn} ${styles.arrowBtn}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Trang trước"
      >
        <HiChevronLeft />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        className={`${styles.pageBtn} ${styles.arrowBtn}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
      >
        <HiChevronRight />
      </button>
    </nav>
  );
};

export default Pagination;
