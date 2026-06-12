import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState = ({
  icon: Icon,
  title = 'Không có dữ liệu',
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className={styles.emptyState}>
      {Icon && (
        <div className={styles.icon}>
          <Icon />
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && (
        <p className={styles.description}>{description}</p>
      )}
      {actionText && onAction && (
        <button className={styles.actionBtn} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
