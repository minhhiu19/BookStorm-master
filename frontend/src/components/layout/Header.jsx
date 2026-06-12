import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineClipboardList,
  HiOutlineLogin,
  HiOutlineUserAdd,
  HiOutlineCog,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Header.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/shop', label: 'Cửa hàng' },
  { to: '/shop?tab=categories', label: 'Thể loại' },
  { to: '/contact', label: 'Liên hệ' },
];

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const isStaff = user?.role === 'STAFF';
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Sticky header scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate('/');
  };

  const wishlistCount = user?.wishlistCount || 0;

  return (
    <>
      {/* Top Bar */}
      <div className={styles.topBar}>
        Miễn phí vận chuyển cho đơn hàng từ 500.000đ
      </div>

      {/* Header */}
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        {/* Main Header */}
        <div className={styles.mainHeader}>
          <div className={styles.headerLeft}>
            <button
              className={`${styles.iconBtn} ${styles.menuBtn}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <HiOutlineMenu />
            </button>
            <button
              className={`${styles.iconBtn} ${styles.searchBtn}`}
              onClick={() => navigate('/shop')}
              aria-label="Tìm kiếm"
            >
              <HiOutlineSearch />
            </button>
          </div>

          <div className={styles.headerCenter}>
            <Link to="/" className={styles.logo}>
              BOOKSTORM
            </Link>
          </div>

          <div className={styles.headerRight}>
            {/* User */}
            <div className={styles.userDropdownWrapper} ref={dropdownRef}>
              <button
                className={styles.iconBtn}
                onClick={() => setUserDropdown(!userDropdown)}
                aria-label="Tài khoản"
              >
                <HiOutlineUser />
              </button>

              {userDropdown && (
                <div className={styles.userDropdown}>
                  {user ? (
                    <>
                      <div className={styles.userDropdownHeader}>
                        <p>{user.name}</p>
                        <p>{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className={`${styles.userDropdownItem} ${styles.adminLink}`}
                          onClick={() => setUserDropdown(false)}
                        >
                          <HiOutlineCog /> Quản trị Admin
                        </Link>
                      )}
                      {isStaff && (
                        <Link
                          to="/staff"
                          className={`${styles.userDropdownItem} ${styles.adminLink}`}
                          onClick={() => setUserDropdown(false)}
                        >
                          <HiOutlineCog /> Quản lý Staff
                        </Link>
                      )}
                      {(isAdmin || isStaff) && <div className={styles.userDropdownDivider} />}
                      <Link
                        to="/profile"
                        className={styles.userDropdownItem}
                        onClick={() => setUserDropdown(false)}
                      >
                        <HiOutlineUser /> Tài khoản
                      </Link>
                      <Link
                        to="/profile/orders"
                        className={styles.userDropdownItem}
                        onClick={() => setUserDropdown(false)}
                      >
                        <HiOutlineClipboardList /> Đơn hàng
                      </Link>
                      <div className={styles.userDropdownDivider} />
                      <button
                        className={styles.userDropdownItem}
                        onClick={handleLogout}
                      >
                        <HiOutlineLogout /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className={styles.userDropdownItem}
                        onClick={() => setUserDropdown(false)}
                      >
                        <HiOutlineLogin /> Đăng nhập
                      </Link>
                      <Link
                        to="/register"
                        className={styles.userDropdownItem}
                        onClick={() => setUserDropdown(false)}
                      >
                        <HiOutlineUserAdd /> Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              className={styles.iconBtn}
              onClick={() => navigate('/wishlist')}
              aria-label="Yêu thích"
            >
              <HiOutlineHeart />
              {wishlistCount > 0 && (
                <span className={styles.badge}>{wishlistCount}</span>
              )}
            </button>

            {/* Cart */}
            <button
              className={styles.iconBtn}
              onClick={() => navigate('/cart')}
              aria-label="Giỏ hàng"
            >
              <HiOutlineShoppingBag />
              {cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => {
              const linkUrl = new URL(link.to, 'http://x');
              const currentPath = location.pathname;
              const currentSearch = location.search;
              let isActive;
              if (link.to === '/') {
                isActive = currentPath === '/';
              } else if (linkUrl.search) {
                isActive = currentPath === linkUrl.pathname && currentSearch === linkUrl.search;
              } else {
                isActive = currentPath === linkUrl.pathname && !currentSearch;
              }
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className={`${styles.mobileOverlay} ${mobileOpen ? styles.mobileOverlayOpen : ''}`}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`${styles.mobileSidebar} ${mobileOpen ? styles.mobileSidebarOpen : ''}`}
      >
        <div className={styles.mobileHeader}>
          <span className={styles.mobileLogoText}>BOOKSTORM</span>
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng menu"
          >
            <HiOutlineX />
          </button>
        </div>
        <nav className={styles.mobileNavList}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={styles.mobileNavItem}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Header;
