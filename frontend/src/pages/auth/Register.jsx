import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ và tên';
    if (!form.email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Email không hợp lệ';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(form.phone.replace(/\s/g, ''))) {
      errs.phone = 'Số điện thoại không hợp lệ';
    }
    if (!form.password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (form.password.length < 6) {
      errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Mật khẩu không khớp';
    }
    if (!form.agreeTerms) {
      errs.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
      await register({
        fullName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      navigate('/login');
    } catch (err) {
      // Error toast is already shown by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Tạo tài khoản</h1>
        <p className={styles.subtitle}>Đăng ký để trải nghiệm mua sắm tại BookStorm</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Họ và tên</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              autoComplete="name"
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              autoComplete="email"
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">Số điện thoại</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="0912 345 678"
              className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              autoComplete="tel"
            />
            {errors.phone && <p className={styles.error}>{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Mật khẩu</label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Ít nhất 6 ký tự"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className={styles.error}>{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <div className={styles.passwordWrap}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className={styles.termsField}>
            <label className={styles.termsLabel}>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
                className={styles.termsCheckbox}
              />
              <span className={styles.termsCheckboxCustom} />
              <span className={styles.termsText}>
                Tôi đồng ý với{' '}
                <Link to="/terms" className={styles.termsLink}>Điều khoản sử dụng</Link>
                {' '}và{' '}
                <Link to="/privacy" className={styles.termsLink}>Chính sách bảo mật</Link>
              </span>
            </label>
            {errors.agreeTerms && <p className={styles.error}>{errors.agreeTerms}</p>}
          </div>

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        {/* Login Link */}
        <p className={styles.switchText}>
          Đã có tài khoản?{' '}
          <Link to="/login" className={styles.switchLink}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
