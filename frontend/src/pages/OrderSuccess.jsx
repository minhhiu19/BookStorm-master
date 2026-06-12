import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import styles from './OrderSuccess.module.css';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('code') || '';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.div
          className={styles.successCard}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className={styles.checkmarkCircle}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              type: 'spring',
              stiffness: 200,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <HiOutlineCheckCircle className={styles.checkIcon} />
            </motion.div>
          </motion.div>

          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            Đặt hàng thành công!
          </motion.h1>

          {orderCode && (
            <motion.div
              className={styles.orderCodeWrapper}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.4 }}
            >
              <span className={styles.orderCodeLabel}>Mã đơn hàng</span>
              <span className={styles.orderCode}>{orderCode}</span>
            </motion.div>
          )}

          <motion.p
            className={styles.thankYou}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            Cảm ơn bạn đã mua hàng tại BookStorm
          </motion.p>

          <motion.p
            className={styles.description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            Chúng tôi sẽ liên hệ với bạn khi đơn hàng được xử lý. Bạn có thể theo dõi
            trạng thái đơn hàng trong trang cá nhân.
          </motion.p>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.4 }}
          >
            <Link
              to={orderCode ? `/profile/orders/${orderCode}` : '/profile/orders'}
              className={styles.primaryBtn}
            >
              Xem đơn hàng
            </Link>
            <Link to="/shop" className={styles.secondaryBtn}>
              Tiếp tục mua sắm
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
