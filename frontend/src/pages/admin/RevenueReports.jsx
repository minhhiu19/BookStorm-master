import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminService from '../../services/adminService';
import styles from './RevenueReports.module.css';

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

function RevenueReports() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedYear, selectedMonth]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      // If specific month is selected, get detailed monthly data
      if (selectedMonth) {
        const monthlyData = await adminService.getMonthlyRevenue(selectedYear, parseInt(selectedMonth));
        const data = monthlyData.data || monthlyData;

        // Set stats from monthly data
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          averageOrder: data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders) : 0,
        });

        // Build chart data for specific month (could be daily breakdown if available)
        setChartData([{
          label: `T${selectedMonth}/${selectedYear}`,
          revenue: data.totalRevenue || 0,
        }]);

        // Monthly breakdown - single month view
        setMonthlyBreakdown([{
          month: parseInt(selectedMonth),
          label: `Tháng ${selectedMonth}`,
          orderCount: data.totalOrders || 0,
          revenue: data.totalRevenue || 0,
          percentage: 100,
        }]);
      } else {
        // Get full year data from dashboard stats
        const statsRes = await adminService.getDashboardStats();
        const statsData = statsRes.data || statsRes;

        // Calculate totals from monthly revenue
        const monthlyRevenue = statsData.monthlyRevenue || [];
        const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
        const totalOrders = monthlyRevenue.reduce((sum, m) => sum + (m.totalOrders || 0), 0);

        setStats({
          totalRevenue,
          totalOrders,
          averageOrder: totalOrders > 0 ? (totalRevenue / totalOrders) : 0,
        });

        // Build chart data for full year
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        setChartData(monthlyRevenue.map((m, i) => ({
          label: months[i] || `T${i + 1}`,
          revenue: m.totalRevenue || 0,
        })));

        // Monthly breakdown table
        setMonthlyBreakdown(monthlyRevenue.map((m, i) => ({
          month: i + 1,
          label: `Tháng ${i + 1}`,
          orderCount: m.totalOrders || 0,
          revenue: m.totalRevenue || 0,
          percentage: totalRevenue > 0 ? ((m.totalRevenue / totalRevenue) * 100) : 0,
        })));
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu báo cáo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartTooltip = (value) => {
    return [formatVND(value), 'Doanh thu'];
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Báo cáo doanh thu</h1>
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
      <h1 className={styles.pageTitle}>Báo cáo doanh thu</h1>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Năm</label>
          <select
            className={styles.filterSelect}
            value={selectedYear}
            onChange={handleYearChange}
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Tháng</label>
          <select
            className={styles.filterSelect}
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            <option value="">Tất cả</option>
            <option value="1">Tháng 1</option>
            <option value="2">Tháng 2</option>
            <option value="3">Tháng 3</option>
            <option value="4">Tháng 4</option>
            <option value="5">Tháng 5</option>
            <option value="6">Tháng 6</option>
            <option value="7">Tháng 7</option>
            <option value="8">Tháng 8</option>
            <option value="9">Tháng 9</option>
            <option value="10">Tháng 10</option>
            <option value="11">Tháng 11</option>
            <option value="12">Tháng 12</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Tổng doanh thu</p>
          <p className={styles.statValue}>{formatVND(safeStats.totalRevenue || 0)}</p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Tổng đơn hàng</p>
          <p className={styles.statValue}>{(safeStats.totalOrders || 0).toLocaleString()}</p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Đơn trung bình</p>
          <p className={styles.statValue}>{formatVND(safeStats.averageOrder || 0)}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>
          Biểu đồ doanh thu {selectedMonth ? `tháng ${selectedMonth}` : ''} năm {selectedYear}
        </h2>
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

      {/* Monthly Breakdown Table */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Chi tiết theo tháng</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Số đơn</th>
                <th>Doanh thu</th>
                <th>Tỉ lệ</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                monthlyBreakdown.map((item) => (
                  <tr key={item.month}>
                    <td>{item.label}</td>
                    <td>{item.orderCount.toLocaleString()}</td>
                    <td>{formatVND(item.revenue)}</td>
                    <td>
                      <div className={styles.percentageCell}>
                        <div className={styles.percentageBar}>
                          <div
                            className={styles.percentageBarFill}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className={styles.percentageText}>
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RevenueReports;
