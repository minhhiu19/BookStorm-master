import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';
import styles from './Modal.module.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.97,
    transition: { duration: 0.2 },
  },
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className={`${styles.modal} ${styles[size]}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {title && (
              <div className={styles.header}>
                <h2 className={styles.title} id="modal-title">
                  {title}
                </h2>
                <button
                  className={styles.closeBtn}
                  onClick={onClose}
                  aria-label="Đóng"
                >
                  <HiOutlineX />
                </button>
              </div>
            )}

            {!title && (
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Đóng"
                style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
              >
                <HiOutlineX />
              </button>
            )}

            <div className={styles.body}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
