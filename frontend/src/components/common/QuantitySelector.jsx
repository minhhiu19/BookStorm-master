import React from 'react';
import { HiMinus, HiPlus } from 'react-icons/hi';
import styles from './QuantitySelector.module.css';

const QuantitySelector = ({
  quantity = 1,
  onChange,
  min = 1,
  max = 99,
}) => {
  const handleDecrease = () => {
    if (quantity > min && onChange) {
      onChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max && onChange) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className={styles.quantitySelector}>
      <button
        className={styles.btn}
        onClick={handleDecrease}
        disabled={quantity <= min}
        aria-label="Giảm số lượng"
      >
        <HiMinus />
      </button>
      <span className={styles.value}>{quantity}</span>
      <button
        className={styles.btn}
        onClick={handleIncrease}
        disabled={quantity >= max}
        aria-label="Tăng số lượng"
      >
        <HiPlus />
      </button>
    </div>
  );
};

export default QuantitySelector;
