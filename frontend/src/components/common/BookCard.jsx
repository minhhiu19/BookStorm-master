import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';
import styles from './BookCard.module.css';

const BookCard = ({ book, onWishlistToggle }) => {
  const [isWishlisted, setIsWishlisted] = useState(book?.isWishlisted || false);

  const {
    id,
    _id,
    slug,
    name = 'Book Name',
    author = '',
    images = [],
    basePrice,
    price,
    salePrice,
    discount,
  } = book || {};

  const displayPrice = Number(basePrice ?? price ?? 0);
  const displaySale = salePrice != null ? Number(salePrice) : null;
  const bookUrl = `/book/${slug || id || _id}`;
  const displayImage = images[0]?.imageUrl || images[0]?.url || (typeof images[0] === 'string' ? images[0] : '/placeholder.jpg');
  const isOnSale = displaySale != null && displaySale < displayPrice;
  const salePercent = isOnSale ? Math.round(((displayPrice - displaySale) / displayPrice) * 100) : 0;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onWishlistToggle) {
      onWishlistToggle(book, !isWishlisted);
    }
  };

  return (
    <div className={styles.card}>
      <Link to={bookUrl} className={styles.imageContainer}>
        <img
          src={displayImage}
          alt={name}
          className={styles.image}
          loading="lazy"
        />

        {(isOnSale || discount) && (
          <span className={styles.saleBadge}>
            -{salePercent || discount}%
          </span>
        )}

        <button
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistBtnActive : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
        >
          {isWishlisted ? <HiHeart /> : <HiOutlineHeart />}
        </button>

        <button className={styles.quickView}>
          Xem nhanh
        </button>
      </Link>

      <Link to={bookUrl} className={styles.info}>
        {author && <div className={styles.brand}>{author}</div>}
        <h3 className={styles.name}>{name}</h3>
        <div className={styles.priceRow}>
          {isOnSale ? (
            <>
              <span className={`${styles.price} ${styles.salePrice}`}>
                {formatPrice(displaySale)}
              </span>
              <span className={styles.originalPrice}>
                {formatPrice(displayPrice)}
              </span>
            </>
          ) : (
            <span className={styles.price}>{formatPrice(displayPrice)}</span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default BookCard;
