import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import styles from './ForgotPassword.module.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) return 'Vui lòng nhập email';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email không hợp lệ';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className={styles.title}>Kiểm tra email của bạn</h1>
          <p className={styles.description}>
            Chúng tôi đã gửi link đặt lại mật khẩu đến{' '}
            <strong className={styles.emailHighlight}>{email}</strong>.
            Vui lòng kiểm tra hộp thư đến và cả thư rác.
          </p>
          <button
            className={styles.resendBtn}
            onClick={() => {
              setSent(false);
              setEmail('');
            }}
          >
            Gửi lại email
          </button>
          <Link to="/login" className={styles.backLink}>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Quên mật khẩu</h1>
        <p className={styles.description}>
          Nhập email đã đăng ký, chúng tôi sẽ gửi link để bạn đặt lại mật khẩu.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="you@example.com"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              autoComplete="email"
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
          </button>
        </form>

        <Link to="/login" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
