import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import styles from './ChangePassword.module.css';

const ChangePassword = () => {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.oldPassword === form.newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu cũ');
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword(form.oldPassword, form.newPassword);
      toast.success('Đổi mật khẩu thành công');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={styles.contentTitle}>Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mật khẩu hiện tại</label>
          <div className={styles.passwordInput}>
            <input
              type={showOld ? 'text' : 'password'}
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowOld(!showOld)}>
              {showOld ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mật khẩu mới</label>
          <div className={styles.passwordInput}>
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(!showNew)}>
              {showNew ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Xác nhận mật khẩu mới</label>
          <div className={styles.passwordInput}>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </div>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </motion.div>
  );
};

export default ChangePassword;
