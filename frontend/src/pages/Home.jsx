import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import bookService from '../services/bookService';
import categoryService from '../services/categoryService';
import bannerService from '../services/bannerService';
import BookCard from '../components/common/BookCard';
import styles from './Home.module.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, categoriesRes, newRes, bannerRes] = await Promise.all([
          bookService.getFeaturedBooks(),
          categoryService.getRootCategories(),
          bookService.getBooks(0, 8, 'createdAt,desc'),
          bannerService.getActiveBanners().catch(() => ({ data: [] })),
        ]);
        setFeaturedBooks(featuredRes.data || []);
        setCategories(categoriesRes.data || []);
        setNewArrivals(newRes.data?.content || newRes.data || []);
        setBanners(bannerRes.data || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Vui long nhap email hop le');
      return;
    }
    toast.success('Dang ky nhan tin thanh cong!');
    setEmail('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const placeholderCategories = [
    { id: 1, name: 'Văn học', slug: 'van-hoc', image: null },
    { id: 2, name: 'Kinh tế', slug: 'kinh-te', image: null },
    { id: 3, name: 'Kỹ năng sống', slug: 'ky-nang-song', image: null },
    { id: 4, name: 'Thiếu nhi', slug: 'thieu-nhi', image: null },
  ];

  const placeholderBooks = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    name: `Sách mẫu ${i + 1}`,
    slug: `sach-mau-${i + 1}`,
    price: 150000 + i * 30000,
    salePrice: i % 2 === 0 ? 120000 + i * 20000 : null,
    images: [],
    author: 'Tác giả',
  }));

  const displayCategories = categories.length > 0 ? categories : placeholderCategories;
  const displayFeatured = featuredBooks.length > 0 ? featuredBooks : placeholderBooks;
  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : placeholderBooks;

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {banners.length > 0 ? (
          <>
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`${styles.heroSlide} ${idx === activeBanner ? styles.heroSlideActive : ''}`}
              >
                <img src={banner.imageUrl} alt={banner.title || ''} className={styles.heroImg} />
              </div>
            ))}
            <div className={styles.heroOverlay}>
              <motion.div
                className={styles.heroContent}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className={styles.heroTitle}>
                  {banners[activeBanner]?.title || 'Khám phá thế giới sách'}
                </h1>
                <p className={styles.heroSubtitle}>Tìm kiếm tri thức và cảm hứng từ những cuốn sách hay nhất</p>
                <Link to={banners[activeBanner]?.linkUrl || '/shop'} className={styles.heroCta}>
                  Khám phá ngay
                </Link>
              </motion.div>
            </div>
            {banners.length > 1 && (
              <div className={styles.heroDots}>
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    className={`${styles.heroDot} ${idx === activeBanner ? styles.heroDotActive : ''}`}
                    onClick={() => setActiveBanner(idx)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.heroImage}>
              <span className={styles.heroImageText}>BOOKSTORM</span>
            </div>
            <div className={styles.heroOverlay}>
              <motion.div
                className={styles.heroContent}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className={styles.heroTitle}>Khám phá thế giới sách</h1>
                <p className={styles.heroSubtitle}>Tìm kiếm tri thức và cảm hứng từ những cuốn sách hay nhất</p>
                <Link to="/shop" className={styles.heroCta}>
                  Khám phá ngay
                </Link>
              </motion.div>
            </div>
          </>
        )}
      </section>

      {/* Categories Section */}
      <motion.section
        className={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
      >
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Danh mục</h2>
          <div className={styles.categoryGrid}>
            {displayCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryImage}>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} />
                  ) : (
                    <span className={styles.categoryPlaceholder}>{cat.name?.charAt(0)}</span>
                  )}
                </div>
                <div className={styles.categoryName}>
                  {cat.name}
                  {cat.productCount > 0 && (
                    <span className={styles.categoryCount}>{cat.productCount} cuốn sách</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Books Section */}
      <motion.section
        className={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <motion.h2 className={styles.sectionTitle} variants={fadeInUp}>
              Sách nổi bật
            </motion.h2>
            <motion.div variants={fadeInUp}>
              <Link to="/shop?sort=featured" className={styles.viewAllLink}>
                Xem tất cả
              </Link>
            </motion.div>
          </div>
          <div className={styles.productGrid}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.productSkeleton}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonText} />
                    <div className={styles.skeletonTextShort} />
                  </div>
                ))
              : displayFeatured.slice(0, 4).map((book) => (
                  <motion.div key={book.id} variants={fadeInUp}>
                    <BookCard book={book} />
                  </motion.div>
                ))}
          </div>
        </div>
      </motion.section>

      {/* Promotion Banner */}
      <motion.section
        className={styles.banner}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
      >
        <div className={styles.container}>
          <div className={styles.bannerInner}>
            <div className={styles.bannerImage}>
              <span className={styles.bannerPlaceholder}>BOOKSTORM</span>
            </div>
            <div className={styles.bannerContent}>
              <h2 className={styles.bannerTitle}>Giảm giá đến 50%</h2>
              <p className={styles.bannerText}>
                Ưu đãi đặc biệt cho bộ sưu tập sách mới. Nhanh tay sở hữu những cuốn sách yêu thích.
              </p>
              <Link to="/shop?sale=true" className={styles.bannerCta}>
                Mua ngay
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* New Arrivals Section */}
      <motion.section
        className={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        <div className={styles.container}>
          <motion.h2 className={styles.sectionTitle} variants={fadeInUp}>
            Sách mới
          </motion.h2>
          <div className={styles.productGrid}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.productSkeleton}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonText} />
                    <div className={styles.skeletonTextShort} />
                  </div>
                ))
              : displayNewArrivals.slice(0, 4).map((book) => (
                  <motion.div key={book.id} variants={fadeInUp}>
                    <BookCard book={book} />
                  </motion.div>
                ))}
          </div>
        </div>
      </motion.section>

      {/* Brand Story -> Bookstore Intro */}
      <motion.section
        className={styles.brandStory}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
      >
        <div className={styles.container}>
          <div className={styles.brandStoryInner}>
            <h2 className={styles.brandStoryTitle}>Về BookStorm</h2>
            <p className={styles.brandStoryText}>
              BookStorm tin rằng sách không chỉ là tri thức, mà còn là nguồn cảm hứng vô tận.
              Chúng tôi mang đến những cuốn sách chất lượng, đa dạng thể loại,
              giúp bạn khám phá thế giới và phát triển bản thân mỗi ngày.
            </p>
            <Link to="/about" className={styles.brandStoryLink}>
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Newsletter */}
      <motion.section
        className={styles.newsletter}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
      >
        <div className={styles.container}>
          <div className={styles.newsletterInner}>
            <h2 className={styles.newsletterTitle}>Nhận tin mới nhất</h2>
            <p className={styles.newsletterText}>
              Đăng ký để nhận thông tin về sách mới và ưu đãi đặc biệt.
            </p>
            <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.newsletterInput}
              />
              <button type="submit" className={styles.newsletterButton}>
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;
