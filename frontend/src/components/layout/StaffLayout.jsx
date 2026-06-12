import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HiOutlineClipboardList,
  HiOutlineCube,
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineHome,
  HiOutlineChartBar,
  HiOutlineRefresh,
  HiOutlineChatAlt2,
  HiOutlineBookOpen,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

const STAFF_NAV = [
  { to: '/staff/dashboard', icon: HiOutlineChartBar, label: 'Tổng quan', end: true },
  { to: '/staff/orders', icon: HiOutlineClipboardList, label: 'Đơn hàng' },
  { to: '/staff/inventory', icon: HiOutlineBookOpen, label: 'Kho sách' },
  { to: '/staff/returns', icon: HiOutlineRefresh, label: 'Đổi/trả' },
  { to: '/staff/support', icon: HiOutlineChatAlt2, label: 'Hỗ trợ KH' },
];

const StaffLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAdminDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (!name) return 'S';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <Link to="/staff/dashboard" className={styles.sidebarLogoLink}>
            BookStorm
          </Link>
          <div className={styles.sidebarLogoSub}>Staff Panel</div>
        </div>

        <nav className={styles.sidebarNav}>
          {STAFF_NAV.map((item) => (
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

          <div style={{ borderTop: '1px solid var(--color-border-light)', margin: '12px 0' }} />

          <NavLink
            to="/"
            className={styles.navLink}
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineHome className={styles.navLinkIcon} />
            Về trang chủ
          </NavLink>
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
                <div className={styles.adminName}>{user?.name || 'Staff'}</div>
                <div className={styles.adminRole}>Nhân viên</div>
              </div>

              {adminDropdown && (
                <div className={styles.adminDropdown}>
                  <Link
                    to="/profile"
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

export default StaffLayout;
