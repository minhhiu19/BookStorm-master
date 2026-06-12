import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineClipboardList,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import staffService from '../../services/staffService';
import styles from './StaffDashboard.module.css';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    confirmedOrders: 0,
    shippingOrders: 0,
    totalActiveOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await staffService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Chờ xác nhận',
      value: stats.pendingOrders,
      icon: HiOutlineClock,
      color: 'warning',
    },
    {
      label: 'Đã xác nhận',
      value: stats.confirmedOrders,
      icon: HiOutlineCheckCircle,
      color: 'info',
    },
    {
      label: 'Đang giao',
      value: stats.shippingOrders,
      icon: HiOutlineTruck,
      color: 'success',
    },
    {
      label: 'Tổng đơn hoạt động',
      value: stats.totalActiveOrders,
      icon: HiOutlineClipboardList,
      color: 'accent',
    },
  ];

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Tổng quan</h1>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} className={`${styles.statCard} ${styles[card.color]}`}>
            <div className={styles.statIcon}>
              <card.icon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{card.value}</div>
              <div className={styles.statLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Thao tác nhanh</h2>
        <div className={styles.actionButtons}>
          <Link to="/staff/orders" className={styles.actionButton}>
            <HiOutlineClipboardList />
            <span>Xử lý đơn hàng</span>
          </Link>
          <Link to="/staff/inventory" className={styles.actionButton}>
            <HiOutlineTruck />
            <span>Kiểm tra kho</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
