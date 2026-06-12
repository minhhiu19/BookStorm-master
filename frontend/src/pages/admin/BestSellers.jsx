import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineTrendingUp, HiOutlineCube } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import styles from './BestSellers.module.css';

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBestSellingBooksDetailed(30);
      const data = response.data || response;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Không thể tải dữ liệu sách bán chạy');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalSold = products.reduce((sum, p) => sum + (p.totalSold || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
  const maxSold = products.length > 0 ? Math.max(...products.map((p) => p.totalSold || 0)) : 1;

  const getRankClass = (index) => {
    if (index === 0) return styles.rankGold;
    if (index === 1) return styles.rankSilver;
    if (index === 2) return styles.rankBronze;
    return '';
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Sách bán chạy</h1>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sách bán chạy</h1>
          <p className={styles.subtitle}>
            Thống kê sách bán nhiều nhất (đơn đã giao thành công)
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={fetchData}>
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng đầu sách</div>
          <div className={styles.statValue}>{products.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng số lượng bán</div>
          <div className={`${styles.statValue} ${styles.statAccent}`}>{totalSold.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng doanh thu</div>
          <div className={styles.statValue}>{formatVND(totalRevenue)}</div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><HiOutlineTrendingUp /></div>
            <h3>Chưa có dữ liệu</h3>
            <p>Chưa có sách nào được bán thành công.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Sách</th>
                <th>Giá</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
                <th>Tỉ lệ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.productId}>
                  <td>
                    <div className={`${styles.rank} ${getRankClass(index)}`}>
                      {index + 1}
                    </div>
                  </td>
                  <td>
                    <div className={styles.productInfo}>
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.productName}
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.productImagePlaceholder}><HiOutlineCube /></div>
                      )}
                      <span className={styles.productName}>{product.bookName || product.productName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.priceText}>{formatVND(product.basePrice || 0)}</span>
                  </td>
                  <td>
                    <span className={styles.soldText}>{(product.totalSold || 0).toLocaleString()}</span>
                  </td>
                  <td>
                    <span className={styles.revenueText}>{formatVND(product.totalRevenue || 0)}</span>
                  </td>
                  <td>
                    <div className={styles.percentageCell}>
                      <div className={styles.percentageBar}>
                        <div
                          className={styles.percentageBarFill}
                          style={{ width: `${maxSold > 0 ? ((product.totalSold || 0) / maxSold) * 100 : 0}%` }}
                        />
                      </div>
                      <span className={styles.percentageText}>
                        {totalSold > 0
                          ? (((product.totalSold || 0) / totalSold) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <Link
                      to={`/admin/books/${product.bookId || product.productId}/edit`}
                      className={styles.viewBtn}
                    >
                      Xem
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default BestSellers;
