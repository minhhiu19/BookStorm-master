import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineGift,
  HiOutlinePhotograph,
  HiOutlineTruck,
  HiOutlineRefresh,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineDocumentReport,
  HiOutlineCube,
  HiOutlineTrendingUp,
  HiOutlineMail,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

const ADMIN_NAV = [
  { to: '/admin', icon: HiOutlineChartBar, label: 'Dashboard', end: true },
  { to: '/admin/books', icon: HiOutlineShoppingBag, label: 'Quản lý sách' },
  { to: '/admin/categories', icon: HiOutlineTag, label: 'Danh mục' },
  { to: '/admin/inventory', icon: HiOutlineCube, label: 'Kho hàng' },
  { to: '/admin/orders', icon: HiOutlineClipboardList, label: 'Đơn hàng' },
  { to: '/admin/users', icon: HiOutlineUsers, label: 'Khách hàng' },
  { to: '/admin/reviews', icon: HiOutlineStar, label: 'Đánh giá' },
  { to: '/admin/coupons', icon: HiOutlineGift, label: 'Khuyến mãi' },
  { to: '/admin/banners', icon: HiOutlinePhotograph, label: 'Banner' },
  { to: '/admin/shipping', icon: HiOutlineTruck, label: 'Vận chuyển' },
  { to: '/admin/returns', icon: HiOutlineRefresh, label: 'Đổi/trả' },
  { to: '/admin/notifications', icon: HiOutlineBell, label: 'Thông báo' },
  { to: '/admin/reports', icon: HiOutlineDocumentReport, label: 'Doanh thu' },
  { to: '/admin/best-sellers', icon: HiOutlineTrendingUp, label: 'Bán chạy' },
  { to: '/admin/contacts', icon: HiOutlineMail, label: 'Liên hệ' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAdminDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <Link to="/admin" className={styles.sidebarLogoLink}>
            BOOKSTORM
          </Link>
          <div className={styles.sidebarLogoSub}>Admin Panel</div>
        </div>

        <nav className={styles.sidebarNav}>
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={styles.navLinkIcon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className={styles.mainArea}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              className={styles.sidebarToggle}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <HiOutlineMenu />
            </button>

            <div className={styles.searchBox}>
              <HiOutlineSearch />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Tìm kiếm..."
              />
            </div>
          </div>

          <div className={styles.topBarRight}>
            <button className={styles.notifBtn} aria-label="Thông báo">
              <HiOutlineBell />
              <span className={styles.notifDot} />
            </button>

            <div
              className={styles.adminUser}
              ref={dropdownRef}
              onClick={() => setAdminDropdown(!adminDropdown)}
            >
              <div className={styles.adminAvatar}>
                {getInitials(user?.name)}
              </div>
              <div className={styles.adminInfo}>
                <div className={styles.adminName}>{user?.name || 'Admin'}</div>
                <div className={styles.adminRole}>{user?.role || 'Quản trị viên'}</div>
              </div>

              {adminDropdown && (
                <div className={styles.adminDropdown}>
                  <Link
                    to="/admin/profile"
                    className={styles.adminDropdownItem}
                    onClick={() => setAdminDropdown(false)}
                  >
                    <HiOutlineUser /> Hồ sơ
                  </Link>
                  <button
                    className={styles.adminDropdownItem}
                    onClick={handleLogout}
                  >
                    <HiOutlineLogout /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
