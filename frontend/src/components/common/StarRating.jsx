import React, { useState } from 'react';
import { HiStar } from 'react-icons/hi';
import styles from './StarRating.module.css';

const StarRating = ({
  rating = 0,
  onRate,
  size = 'md',
  readonly = true,
  totalStars = 5,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const isInteractive = !readonly && typeof onRate === 'function';
  const displayRating = hoverRating || rating;

  const renderStar = (index) => {
    const starValue = index + 1;
    const filled = displayRating >= starValue;
    const halfFilled = !filled && displayRating >= starValue - 0.5;

    if (halfFilled && !isInteractive) {
      return (
        <span
          key={index}
          className={`${styles.star} ${styles.starHalf}`}
        >
          <HiStar />
          <span className={styles.starHalfFill}>
            <HiStar />
          </span>
        </span>
      );
    }

    return (
      <span
        key={index}
        className={`${styles.star} ${filled ? styles.starFilled : ''}`}
        onClick={() => isInteractive && onRate(starValue)}
        onMouseEnter={() => isInteractive && setHoverRating(starValue)}
        onMouseLeave={() => isInteractive && setHoverRating(0)}
        role={isInteractive ? 'button' : undefined}
        aria-label={isInteractive ? `${starValue} sao` : undefined}
      >
        <HiStar />
      </span>
    );
  };

  return (
    <div
      className={`${styles.starRating} ${styles[size]} ${isInteractive ? styles.interactive : ''}`}
      aria-label={`Đánh giá ${rating} trên ${totalStars} sao`}
    >
      {Array.from({ length: totalStars }, (_, i) => renderStar(i))}
    </div>
  );
};

export default StarRating;
