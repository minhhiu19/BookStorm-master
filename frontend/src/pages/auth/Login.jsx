import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Email không hợp lệ';
    }
    if (!form.password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (form.password.length < 6) {
      errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      // Error toast is already shown by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Đăng nhập</h1>
        <p className={styles.subtitle}>Chào mừng bạn quay lại BookStorm</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
                placeholder="Nhập mật khẩu"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                autoComplete="current-password"
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

          {/* Forgot password */}
          <div className={styles.forgotRow}>
            <Link to="/forgot-password" className={styles.forgotLink}>
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Register Link */}
        <p className={styles.switchText}>
          Chưa có tài khoản?{' '}
          <Link to="/register" className={styles.switchLink}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
