import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
} from 'react-icons/hi';
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        {/* About */}
        <div>
          <h3 className={styles.columnTitle}>BookStorm</h3>
          <p className={styles.aboutText}>
            BookStorm - Nhà sách online hàng đầu với hàng ngàn đầu sách đa dạng.
            Chúng tôi mang đến cho bạn kho tri thức phong phú từ văn học, khoa học,
            kỹ năng sống đến sách thiếu nhi và nhiều thể loại hấp dẫn khác.
          </p>
          <div className={styles.socialLinks}>
            <a
              href="https://facebook.com"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://tiktok.com"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
            <a
              href="https://youtube.com"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Support Links */}
        <div>
          <h3 className={styles.columnTitle}>Hỗ trợ</h3>
          <nav className={styles.linkList}>
            <Link to="/faq" className={styles.linkItem}>Câu hỏi thường gặp</Link>
            <Link to="/shipping" className={styles.linkItem}>Hướng dẫn đặt hàng</Link>
            <Link to="/payment-guide" className={styles.linkItem}>Phương thức thanh toán</Link>
            <Link to="/track-order" className={styles.linkItem}>Tra cứu đơn hàng</Link>
            <Link to="/contact" className={styles.linkItem}>Liên hệ hỗ trợ</Link>
          </nav>
        </div>

        {/* Policy Links */}
        <div>
          <h3 className={styles.columnTitle}>Chính sách</h3>
          <nav className={styles.linkList}>
            <Link to="/policy/shipping" className={styles.linkItem}>Chính sách vận chuyển</Link>
            <Link to="/policy/return" className={styles.linkItem}>Chính sách đổi trả</Link>
            <Link to="/policy/warranty" className={styles.linkItem}>Chính sách bảo hành</Link>
            <Link to="/policy/privacy" className={styles.linkItem}>Chính sách bảo mật</Link>
            <Link to="/policy/terms" className={styles.linkItem}>Điều khoản dịch vụ</Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h3 className={styles.columnTitle}>Liên hệ</h3>
          <div className={styles.contactItem}>
            <HiOutlineLocationMarker className={styles.contactIcon} />
            <span>268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh</span>
          </div>
          <div className={styles.contactItem}>
            <HiOutlinePhone className={styles.contactIcon} />
            <span>028 3863 2052</span>
          </div>
          <div className={styles.contactItem}>
            <HiOutlineMail className={styles.contactIcon} />
            <span>support@bookstorm.vn</span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className={styles.footerBottom}>
        <div className={styles.footerBottomInner}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} BookStorm. All rights reserved.
          </p>
          <div className={styles.paymentMethods}>
            <span className={styles.paymentIcon}>VISA</span>
            <span className={styles.paymentIcon}>MC</span>
            <span className={styles.paymentIcon}>MOMO</span>
            <span className={styles.paymentIcon}>VNPAY</span>
            <span className={styles.paymentIcon}>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
