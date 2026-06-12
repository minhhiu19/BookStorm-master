import React, { useState } from 'react';
import { HiPaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import styles from './AdminNotifications.module.css';

const NOTIFICATION_TYPES = [
  { value: 'ORDER_UPDATE', label: 'Cập nhật đơn hàng' },
  { value: 'PROMOTION', label: 'Khuyến mãi' },
  { value: 'SYSTEM', label: 'Hệ thống' },
];

const EMPTY_FORM = {
  title: '',
  message: '',
  type: 'ORDER_UPDATE',
  target: 'all',
  userEmail: '',
};

function AdminNotifications() {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [sending, setSending] = useState(false);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề thông báo');
      return;
    }
    if (!form.message.trim()) {
      toast.error('Vui lòng nhập nội dung thông báo');
      return;
    }
    if (form.target === 'specific' && !form.userEmail.trim()) {
      toast.error('Vui lòng nhập email người nhận');
      return;
    }

    try {
      setSending(true);

      if (form.target === 'all') {
        // Send to all users
        const payload = {
          title: form.title,
          message: form.message,
          type: form.type,
        };
        await adminService.sendBulkNotification(payload);
        toast.success('Đã gửi thông báo đến tất cả người dùng');
      } else {
        // Send to specific user
        const payload = {
          title: form.title,
          message: form.message,
          type: form.type,
          userEmail: form.userEmail,
        };
        await adminService.sendNotification(payload);
        toast.success(`Đã gửi thông báo đến ${form.userEmail}`);
      }

      // Reset form
      setForm({ ...EMPTY_FORM });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi thông báo';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Gửi thông báo</h1>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tiêu đề *</label>
            <input
              className={styles.formInput}
              type="text"
              value={form.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="Nhập tiêu đề thông báo"
              maxLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nội dung *</label>
            <textarea
              className={styles.formTextarea}
              value={form.message}
              onChange={(e) => handleFormChange('message', e.target.value)}
              placeholder="Nhập nội dung thông báo"
              rows={5}
              maxLength={500}
            />
            <div className={styles.charCount}>
              {form.message.length}/500 ký tự
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Loại thông báo *</label>
            <select
              className={styles.formInput}
              value={form.type}
              onChange={(e) => handleFormChange('type', e.target.value)}
            >
              {NOTIFICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Người nhận *</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="target"
                  value="all"
                  checked={form.target === 'all'}
                  onChange={(e) => handleFormChange('target', e.target.value)}
                />
                Tất cả người dùng
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="target"
                  value="specific"
                  checked={form.target === 'specific'}
                  onChange={(e) => handleFormChange('target', e.target.value)}
                />
                Người dùng cụ thể
              </label>
            </div>
          </div>

          {form.target === 'specific' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email người nhận *</label>
              <input
                className={styles.formInput}
                type="email"
                value={form.userEmail}
                onChange={(e) => handleFormChange('userEmail', e.target.value)}
                placeholder="example@email.com"
              />
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setForm({ ...EMPTY_FORM })}
              disabled={sending}
            >
              Đặt lại
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={sending}
            >
              <HiPaperAirplane />
              {sending ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.infoCard}>
        <h3 className={styles.infoTitle}>Hướng dẫn sử dụng</h3>
        <ul className={styles.infoList}>
          <li>
            <strong>Tiêu đề:</strong> Nên ngắn gọn, súc tích (tối đa 100 ký tự)
          </li>
          <li>
            <strong>Nội dung:</strong> Mô tả chi tiết thông báo (tối đa 500 ký tự)
          </li>
          <li>
            <strong>Loại thông báo:</strong>
            <ul className={styles.subList}>
              <li>Cập nhật đơn hàng: Thông báo về trạng thái đơn hàng</li>
              <li>Khuyến mãi: Thông báo về chương trình giảm giá, sale</li>
              <li>Hệ thống: Thông báo bảo trì, cập nhật hệ thống</li>
            </ul>
          </li>
          <li>
            <strong>Người nhận:</strong>
            <ul className={styles.subList}>
              <li>Tất cả người dùng: Gửi cho toàn bộ người dùng trong hệ thống</li>
              <li>Người dùng cụ thể: Gửi cho một người dùng theo email</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AdminNotifications;
