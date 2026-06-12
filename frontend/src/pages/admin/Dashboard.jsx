import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineUsers, HiOutlineShoppingBag } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminService from '../../services/adminService';
import styles from './Dashboard.module.css';

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', className: 'badgePending' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'badgeConfirmed' },
  SHIPPING: { label: 'Đang giao', className: 'badgeShipping' },
  DELIVERED: { label: 'Đã giao', className: 'badgeDelivered' },
  CANCELLED: { label: 'Đã hủy', className: 'badgeCancelled' },
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getOrders(0, 5),
        adminService.getBestSellingBooks(5),
      ]);
      const statsData = statsRes.data || statsRes;
      setStats(statsData);
      // Build chart data from monthlyRevenue in stats
      const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      const monthly = statsData?.monthlyRevenue || [];
      setChartData(monthly.map((m, i) => ({
        label: months[i] || `T${i + 1}`,
        revenue: m.totalRevenue || 0,
      })));
      setBestSellers(productsRes.data || productsRes || []);
      // Recent orders from separate call
      const ordersData = ordersRes.data || ordersRes;
      setRecentOrders(ordersData?.content || ordersData || []);

      // Fetch low stock items
      try {
        const booksFullRes = await adminService.getBooks(0, 100);
        const booksData = booksFullRes.data || booksFullRes;
        const allBooks = booksData.content || booksData || [];

        const lowStock = [];
        allBooks.forEach(book => {
          const stock = book.stockQuantity ?? 0;
          if (stock < 10) {
            lowStock.push({
              bookId: book.id,
              bookName: book.name,
              author: book.author || '-',
              stock: stock,
            });
          }
        });

        // Sort: out of stock first, then by stock ascending
        lowStock.sort((a, b) => a.stock - b.stock);
        setLowStockItems(lowStock.slice(0, 20)); // Show top 20
      } catch (err) {
        console.error('Failed to fetch low stock:', err);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu tổng quan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartTooltip = (value) => {
    return [formatVND(value), 'Doanh thu'];
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Tổng quan</h1>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  const safeStats = stats || {};

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Tổng quan</h1>

      {/* Main Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconOrders}`}>
            <HiOutlineClipboardList />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Tổng đơn hàng</p>
            <p className={styles.statValue}>{(safeStats.totalOrders || 0).toLocaleString()}</p>
            <span className={`${styles.statChange} ${(safeStats.orderChange || 0) >= 0 ? styles.statChangeUp : styles.statChangeDown}`}>
              {(safeStats.orderChange || 0) >= 0 ? '+' : ''}{safeStats.orderChange || 0}%
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconRevenue}`}>
            <HiOutlineCurrencyDollar />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Doanh thu</p>
            <p className={styles.statValue}>{formatVND(safeStats.totalRevenue || 0)}</p>
            <span className={`${styles.statChange} ${(safeStats.revenueChange || 0) >= 0 ? styles.statChangeUp : styles.statChangeDown}`}>
              {(safeStats.revenueChange || 0) >= 0 ? '+' : ''}{safeStats.revenueChange || 0}%
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconCustomers}`}>
            <HiOutlineUsers />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Khách hàng</p>
            <p className={styles.statValue}>{(safeStats.totalCustomers || 0).toLocaleString()}</p>
            <span className={`${styles.statChange} ${(safeStats.customerChange || 0) >= 0 ? styles.statChangeUp : styles.statChangeDown}`}>
              {(safeStats.customerChange || 0) >= 0 ? '+' : ''}{safeStats.customerChange || 0}%
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconProducts}`}>
            <HiOutlineShoppingBag />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Tổng số sách</p>
            <p className={styles.statValue}>{(safeStats.totalProducts || safeStats.totalBooks || 0).toLocaleString()}</p>
            <span className={`${styles.statChange} ${(safeStats.productChange || 0) >= 0 ? styles.statChangeUp : styles.statChangeDown}`}>
              {(safeStats.productChange || 0) >= 0 ? '+' : ''}{safeStats.productChange || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Today Stats */}
      <div className={styles.todayGrid}>
        <div className={styles.todayCard}>
          <p className={styles.todayLabel}>Đơn hàng hôm nay</p>
          <p className={styles.todayValue}>{(safeStats.todayOrders || 0).toLocaleString()}</p>
        </div>
        <div className={styles.todayCard}>
          <p className={styles.todayLabel}>Doanh thu hôm nay</p>
          <p className={styles.todayValue}>{formatVND(safeStats.todayRevenue || 0)}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Biểu đồ doanh thu</h2>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4745A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C4745A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DC" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#6B6B6B' }}
                axisLine={{ stroke: '#E5E2DC' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#6B6B6B' }}
                axisLine={{ stroke: '#E5E2DC' }}
                tickLine={false}
                tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v.toLocaleString()}
              />
              <Tooltip
                formatter={formatChartTooltip}
                contentStyle={{
                  fontFamily: 'DM Sans',
                  fontSize: 13,
                  border: '1px solid #E5E2DC',
                  borderRadius: 8,
                  boxShadow: 'none',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C4745A"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Recent Orders + Best Sellers */}
      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Đơn hàng gần đây</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      Chưa có đơn hàng
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusInfo = STATUS_MAP[order.status] || { label: order.status, className: 'badgePending' };
                    return (
                      <tr key={order.id || order.orderCode}>
                        <td>{order.orderCode || `#${order.id}`}</td>
                        <td>{order.customerName || order.user?.fullName || '---'}</td>
                        <td>{formatVND(order.totalAmount || 0)}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[statusInfo.className]}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>
                          {order.createdAt
                            ? format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: vi })
                            : '---'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Sách bán chạy</h2>
          <div>
            {bestSellers.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
                Chưa có dữ liệu
              </p>
            ) : (
              bestSellers.map((item, index) => (
                <div key={item.id || index} className={styles.bestSellerItem}>
                  <div className={styles.bestSellerRank}>{index + 1}</div>
                  <div className={styles.bestSellerImage}>
                    {item.image || (item.images && item.images.length > 0) ? (
                      <img src={item.image || item.images?.[0]?.url || item.images?.[0]} alt={item.name} />
                    ) : (
                      <div className={styles.bestSellerImagePlaceholder}>
                        {item.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className={styles.bestSellerInfo}>
                    <p className={styles.bestSellerName}>{item.name || item.productName}</p>
                    <p className={styles.bestSellerSold}>Đã bán: {(item.soldCount || item.totalSold || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className={styles.lowStockSection}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              Cảnh báo tồn kho
              <span className={styles.lowStockCount}>{lowStockItems.length}</span>
            </h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sách</th>
                    <th>Tác giả</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, idx) => (
                    <tr key={`${item.bookId}-${idx}`}>
                      <td style={{ fontWeight: 500 }}>{item.bookName}</td>
                      <td><span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{item.author}</span></td>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ color: item.stock === 0 ? 'var(--color-error)' : 'var(--color-warning)' }}>
                          {item.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${item.stock === 0 ? styles.badgeCancelled : styles.badgePending}`}>
                          {item.stock === 0 ? 'Hết hàng' : 'Sắp hết'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
