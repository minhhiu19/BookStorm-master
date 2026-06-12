import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineClipboardList,
  HiOutlineRefresh,
  HiOutlineBell,
  HiOutlineLockClosed,
  HiOutlineCamera,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import styles from './Profile.module.css';

const SIDEBAR_LINKS = [
  { to: '/profile', label: 'Thông tin cá nhân', icon: HiOutlineUser, end: true },
  { to: '/profile/addresses', label: 'Địa chỉ', icon: HiOutlineLocationMarker },
  { to: '/profile/orders', label: 'Đơn hàng', icon: HiOutlineClipboardList },
  { to: '/profile/returns', label: 'Đổi/trả hàng', icon: HiOutlineRefresh },
  { to: '/profile/notifications', label: 'Thông báo', icon: HiOutlineBell },
  { to: '/profile/change-password', label: 'Đổi mật khẩu', icon: HiOutlineLockClosed },
];

const ProfileInfo = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }
    try {
      const response = await userService.uploadAvatar(file);
      updateUser({ ...user, avatar: response.data });
      toast.success('Cập nhật ảnh đại diện thành công');
    } catch {
      toast.error('Không thể tải ảnh lên');
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }
    setSaving(true);
    try {
      const response = await userService.updateProfile({
        fullName: form.name,
        phone: form.phone,
      });
      updateUser(response.data);
      toast.success('Cập nhật thông tin thành công');
    } catch {
      toast.error('Không thể cập nhật thông tin');
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
      <h2 className={styles.contentTitle}>Thông tin cá nhân</h2>

      <div className={styles.avatarSection}>
        <div className={styles.avatar}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span className={styles.avatarInitial}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
          <button className={styles.avatarUpload} aria-label="Thay đổi ảnh đại diện" onClick={() => fileInputRef.current?.click()}>
            <HiOutlineCamera />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div>
          <p className={styles.avatarName}>{user?.name}</p>
          <p className={styles.avatarEmail}>{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.profileForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Họ tên</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập họ tên"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              className={styles.readonlyInput}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className={styles.formGroup} />
        </div>
        <button
          type="submit"
          className={styles.saveBtn}
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : 'Cập nhật'}
        </button>
      </form>
    </motion.div>
  );
};

const Profile = () => {
  const location = useLocation();
  const isProfileRoot =
    location.pathname === '/profile';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.profileLayout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <nav className={styles.sidebarNav}>
              {SIDEBAR_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
                    }
                  >
                    <Icon className={styles.sidebarIcon} />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className={styles.content}>
            {isProfileRoot ? <ProfileInfo /> : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
