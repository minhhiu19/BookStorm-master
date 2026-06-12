import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookService from '../services/bookService';
import cartService from '../services/cartService';
import reviewService from '../services/reviewService';
import wishlistService from '../services/wishlistService';
import { useAuth } from '../context/AuthContext';
import styles from './BookDetail.module.css';

function BookDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageRef = useRef(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res = await bookService.getBookBySlug(slug);
        const bookData = res.data;
        setBook(bookData);
        setSelectedImage(0);
        setQuantity(1);

        // Fetch related books by same category
        const catId = bookData.categoryId || bookData.category?.id;
        if (catId) {
          try {
            const relatedRes = await bookService.getBooksByCategory(catId, 0, 4);
            const items = relatedRes.data?.content || relatedRes.data || [];
            setRelatedBooks(items.filter((b) => b.id !== bookData.id).slice(0, 4));
          } catch {
            setRelatedBooks([]);
          }
        }

        // Fetch reviews
        try {
          const reviewRes = await reviewService.getProductReviews(bookData.id, 0, 10);
          const reviewData = reviewRes.data || reviewRes;
          setReviews(reviewData.content || reviewData || []);
        } catch {
          setReviews([]);
        }

        // Check wishlist status
        if (isAuthenticated) {
          try {
            const wishRes = await wishlistService.checkWishlist(bookData.id);
            setIsWishlisted(wishRes.data || false);
          } catch { /* silent */ }
        }
      } catch (err) {
        console.error('Failed to fetch book:', err);
        toast.error('Không thể tải thông tin sách');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
    window.scrollTo({ top: 0 });
  }, [slug, isAuthenticated]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await cartService.addToCart(book.id, quantity);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Vui lòng đăng nhập');
        navigate('/login');
      } else {
        toast.error('Không thể thêm vào giỏ hàng');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm yêu thích');
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(book.id);
        setIsWishlisted(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await wishlistService.addToWishlist(book.id);
        setIsWishlisted(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch {
      toast.error('Không thể cập nhật yêu thích');
    }
  };

  const handleImageZoom = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const handleOpenReviewForm = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      navigate('/login');
      return;
    }
    setShowReviewForm(true);
    setReviewRating(0);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        productId: book.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Đánh giá thành công!');
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');
      // Reload reviews
      const reviewRes = await reviewService.getProductReviews(book.id, 0, 10);
      const reviewData = reviewRes.data || reviewRes;
      setReviews(reviewData.content || reviewData || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi đánh giá';
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i < rating ? 'var(--color-warning)' : 'none'}
        stroke="var(--color-warning)"
        strokeWidth="1.5"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percent: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  if (loading) {
    return (
      <div className={styles.detail}>
        <div className={styles.container}>
          <div className={styles.skeletonBreadcrumb} />
          <div className={styles.layout}>
            <div className={styles.skeletonMainImage} />
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonLine} style={{ width: '30%' }} />
              <div className={styles.skeletonLine} style={{ width: '70%', height: '32px' }} />
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
              <div className={styles.skeletonLine} style={{ width: '25%', height: '28px' }} />
              <div className={styles.skeletonLine} style={{ width: '100%', height: '48px', marginTop: '24px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className={styles.detail}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <p>Không tìm thấy sách.</p>
            <Link to="/shop" className={styles.backLink}>Quay lại cửa hàng</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = book.images && book.images.length > 0
    ? book.images.map((img) => (typeof img === 'string' ? img : img.imageUrl || img.url))
    : [];

  return (
    <div className={styles.detail}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Trang chủ</Link>
          <span className={styles.breadcrumbSep}>/</span>
          {(book.categoryName || book.category?.name) && (
            <>
              <Link to={`/shop?category=${book.categoryId}`}>{book.categoryName || book.category?.name}</Link>
              <span className={styles.breadcrumbSep}>/</span>
            </>
          )}
          <span>{book.name}</span>
        </nav>

        {/* Main Layout */}
        <div className={styles.layout}>
          {/* Images */}
          <div className={styles.images}>
            <div
              className={styles.mainImage}
              ref={imageRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleImageZoom}
            >
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={book.name}
                  className={styles.mainImg}
                  style={
                    isZooming
                      ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          transform: 'scale(1.8)',
                        }
                      : {}
                  }
                />
              ) : (
                <div className={styles.mainImagePlaceholder}>
                  <span>{book.name?.charAt(0)}</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`${styles.thumbnail} ${
                      idx === selectedImage ? styles.thumbnailActive : ''
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt={`${book.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className={styles.info}>
            {book.author && <p className={styles.brand}>{book.author}</p>}
            <h1 className={styles.productName}>{book.name}</h1>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>{renderStars(Math.round(averageRating))}</div>
              <span className={styles.reviewCount}>({reviews.length} đánh giá)</span>
            </div>

            {/* Price */}
            <div className={styles.priceBlock}>
              {book.salePrice ? (
                <>
                  <span className={styles.salePrice}>{formatPrice(book.salePrice)}</span>
                  <span className={styles.originalPrice}>{formatPrice(book.basePrice)}</span>
                </>
              ) : (
                <span className={styles.price}>{formatPrice(book.basePrice)}</span>
              )}
            </div>

            {/* Book Info Section */}
            <div className={styles.optionGroup}>
              <p className={styles.optionLabel}>Thông tin sách</p>
              <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
                {book.author && <div><strong>Tác giả:</strong> {book.author}</div>}
                {book.publisher && <div><strong>Nhà xuất bản:</strong> {book.publisher}</div>}
                {book.isbn && <div><strong>ISBN:</strong> {book.isbn}</div>}
                {book.publishYear && <div><strong>Năm xuất bản:</strong> {book.publishYear}</div>}
                {book.pageCount && <div><strong>Số trang:</strong> {book.pageCount}</div>}
              </div>
            </div>

            {/* Quantity */}
            <div className={styles.optionGroup}>
              <p className={styles.optionLabel}>
                Số lượng
                {book.stockQuantity != null && (
                  <span className={styles.stockInfo}> (Còn {book.stockQuantity} cuốn)</span>
                )}
              </p>
              <div className={styles.quantitySelector}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button
                  className={styles.quantityBtn}
                  onClick={() => {
                    const maxQty = book.stockQuantity || 99;
                    setQuantity(Math.min(quantity + 1, maxQty));
                  }}
                  disabled={book.stockQuantity != null && quantity >= book.stockQuantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={addingToCart || (book.stockQuantity != null && book.stockQuantity <= 0)}
              >
                {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>
              <button
                className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistBtnActive : ''}`}
                onClick={handleWishlistToggle}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isWishlisted ? 'var(--color-accent)' : 'none'}
                  stroke={isWishlisted ? 'var(--color-accent)' : 'currentColor'}
                  strokeWidth="1.5"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Thêm vào yêu thích
              </button>
            </div>

            {/* Accordion */}
            <div className={styles.accordions}>
              <div className={styles.accordionItem}>
                <button
                  className={`${styles.accordionHeader} ${
                    activeAccordion === 'description' ? styles.accordionHeaderActive : ''
                  }`}
                  onClick={() => toggleAccordion('description')}
                >
                  <span>Mô tả sách</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={activeAccordion === 'description' ? styles.accordionIconOpen : ''}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {activeAccordion === 'description' && (
                  <div className={styles.accordionBody}>
                    <p>{book.description || 'Chưa có mô tả cho cuốn sách này.'}</p>
                  </div>
                )}
              </div>

              <div className={styles.accordionItem}>
                <button
                  className={`${styles.accordionHeader} ${
                    activeAccordion === 'returns' ? styles.accordionHeaderActive : ''
                  }`}
                  onClick={() => toggleAccordion('returns')}
                >
                  <span>Chính sách đổi trả</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={activeAccordion === 'returns' ? styles.accordionIconOpen : ''}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {activeAccordion === 'returns' && (
                  <div className={styles.accordionBody}>
                    <ul className={styles.returnsList}>
                      <li>Đổi trả miễn phí trong vòng 30 ngày kể từ ngày mua.</li>
                      <li>Sách phải còn nguyên bao bì và chưa qua sử dụng.</li>
                      <li>Hoàn tiền trong vòng 5-7 ngày làm việc sau khi nhận hàng đổi trả.</li>
                      <li>Liên hệ hotline 1900-xxxx để được hỗ trợ.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className={styles.reviewsSection}>
          <h2 className={styles.reviewsTitle}>Đánh giá sách</h2>
          <div className={styles.reviewsSummary}>
            <div className={styles.reviewsAverage}>
              <span className={styles.averageNumber}>{averageRating}</span>
              <div>
                <div className={styles.stars}>{renderStars(Math.round(averageRating))}</div>
                <span className={styles.totalReviews}>{reviews.length} đánh giá</span>
              </div>
            </div>
            <div className={styles.ratingBars}>
              {ratingBreakdown.map(({ star, count, percent }) => (
                <div key={star} className={styles.ratingBar}>
                  <span className={styles.ratingBarLabel}>{star}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-warning)" stroke="var(--color-warning)" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <div className={styles.ratingBarTrack}>
                    <div className={styles.ratingBarFill} style={{ width: `${percent}%` }} />
                  </div>
                  <span className={styles.ratingBarCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className={styles.reviewForm}>
              <h3 className={styles.reviewFormTitle}>Viết đánh giá của bạn</h3>
              <div className={styles.reviewFormRating}>
                <span className={styles.reviewFormLabel}>Đánh giá:</span>
                <div className={styles.reviewStarPicker}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={styles.reviewStarBtn}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      onClick={() => setReviewRating(star)}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill={(reviewHover || reviewRating) >= star ? 'var(--color-warning)' : 'none'}
                        stroke="var(--color-warning)"
                        strokeWidth="1.5"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                  {reviewRating > 0 && (
                    <span className={styles.reviewRatingText}>
                      {reviewRating === 1 && 'Rất tệ'}
                      {reviewRating === 2 && 'Tệ'}
                      {reviewRating === 3 && 'Bình thường'}
                      {reviewRating === 4 && 'Tốt'}
                      {reviewRating === 5 && 'Rất tốt'}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.reviewFormGroup}>
                <label className={styles.reviewFormLabel}>Nhận xét:</label>
                <textarea
                  className={styles.reviewTextarea}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                  rows={4}
                />
              </div>
              <div className={styles.reviewFormActions}>
                <button
                  className={styles.reviewSubmitBtn}
                  onClick={handleSubmitReview}
                  disabled={submittingReview || reviewRating === 0}
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
                <button
                  className={styles.reviewCancelBtn}
                  onClick={() => setShowReviewForm(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          <div className={styles.reviewsList}>
            {reviews.length === 0 && !showReviewForm && (
              <p className={styles.noReviews}>Chưa có đánh giá nào cho cuốn sách này.</p>
            )}
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    <div className={styles.reviewAvatar}>{review.userName?.charAt(0)}</div>
                    <div>
                      <p className={styles.reviewUserName}>{review.userName}</p>
                      <p className={styles.reviewDate}>
                        {new Date(review.createdAt || review.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className={styles.stars}>{renderStars(review.rating)}</div>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}
          </div>

          {!showReviewForm && (
            <button className={styles.writeReviewBtn} onClick={handleOpenReviewForm}>
              Viết đánh giá
            </button>
          )}
        </section>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Sách liên quan</h2>
            <div className={styles.relatedGrid}>
              {relatedBooks.map((b) => (
                <Link
                  key={b.id}
                  to={`/book/${b.slug || b.id}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImage}>
                    {b.images && b.images.length > 0 ? (
                      <img src={b.images[0]?.imageUrl || b.images[0]?.url || b.images[0]} alt={b.name} />
                    ) : (
                      <span className={styles.relatedPlaceholder}>{b.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className={styles.relatedInfo}>
                    <p className={styles.relatedBrand}>{b.author || ''}</p>
                    <h3 className={styles.relatedName}>{b.name}</h3>
                    <span className={styles.relatedPrice}>{formatPrice(b.salePrice || b.basePrice)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default BookDetail;
