import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import styles from './ResetPassword.module.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!newPassword) {
      errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Đã có lỗi xảy ra. Token có thể đã hết hạn.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Link không hợp lệ</h1>
          <p className={styles.description}>
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            Vui lòng yêu cầu gửi lại email.
          </p>
          <Link to="/forgot-password" className={styles.loginBtn}>
            Quên mật khẩu
          </Link>
          <br />
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

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className={styles.title}>Đặt lại mật khẩu thành công</h1>
          <p className={styles.description}>
            Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.
          </p>
          <Link to="/login" className={styles.loginBtn}>
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Đặt lại mật khẩu</h1>
        <p className={styles.description}>
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="newPassword">Mật khẩu mới</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
              }}
              placeholder="Ít nhất 6 ký tự"
              className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
              autoFocus
            />
            {errors.newPassword && <p className={styles.error}>{errors.newPassword}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              placeholder="Nhập lại mật khẩu"
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            />
            {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
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

export default ResetPassword;
