import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        <div className={`${styles.spinner} ${styles.spinnerLg}`} />
        <span className={styles.logoText}>BOOKSTORM</span>
      </div>
    );
  }

  return (
    <div className={styles.inline}>
      <div className={`${styles.spinner} ${styles.spinnerSm}`} />
    </div>
  );
};

export default Loading;
