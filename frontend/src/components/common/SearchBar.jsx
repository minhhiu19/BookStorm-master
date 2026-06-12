import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HiOutlineSearch, HiOutlineX, HiOutlineClock } from 'react-icons/hi';
import styles from './SearchBar.module.css';

const SearchBar = ({
  onSearch,
  placeholder = 'Tìm kiếm sản phẩm...',
  suggestions = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Lock body scroll when search is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      if (query.trim() && onSearch) {
        onSearch(query.trim());
        handleClose();
      }
    },
    [query, onSearch]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
    setQuery(text);
    if (onSearch) {
      onSearch(text);
    }
    handleClose();
  };

  return (
    <div className={styles.searchBarWrapper}>
      <button
        className={styles.searchTrigger}
        onClick={handleOpen}
        aria-label="Tìm kiếm"
      >
        <HiOutlineSearch />
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={handleClose} />
          <div className={styles.searchExpanded}>
            <form className={styles.searchInner} onSubmit={handleSubmit}>
              <div className={styles.searchInputWrapper}>
                <HiOutlineSearch className={styles.searchIcon} />
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.searchInput}
                  value={query}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  autoComplete="off"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {suggestions.map((item, index) => (
                      <div
                        key={index}
                        className={styles.suggestionItem}
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <HiOutlineClock className={styles.suggestionIcon} />
                        <span className={styles.suggestionText}>
                          {typeof item === 'string' ? item : item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label="Đóng tìm kiếm"
              >
                <HiOutlineX />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchBar;
