import React, { useState, useEffect, useCallback } from 'react';
import { HiLockClosed, HiLockOpen, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminService from '../../services/adminService';
import styles from './Users.module.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [roleChanging, setRoleChanging] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(page, 20, searchDebounce);
      const data = res.data || res;
      setUsers(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounce]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    try {
      setToggling(true);
      await adminService.toggleUserActive(confirmTarget.id);
      toast.success(
        confirmTarget.enabled !== false
          ? 'Đã khóa tài khoản'
          : 'Đã mở khóa tài khoản'
      );
      setConfirmTarget(null);
      fetchUsers();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setToggling(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const roleLabels = { CUSTOMER: 'Khách hàng', STAFF: 'Nhân viên', ADMIN: 'Quản trị viên' };
    try {
      setRoleChanging(userId);
      await adminService.updateUserRole(userId, newRole);
      toast.success(`Đã đổi vai trò thành ${roleLabels[newRole]}`);
      fetchUsers();
    } catch (error) {
      toast.error('Không thể đổi vai trò');
    } finally {
      setRoleChanging(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Quản lý khách hàng</h1>

      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Tìm kiếm theo tên, email, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Đang tải...
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>Không tìm thấy khách hàng nào</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Ngày đăng ký</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className={styles.avatar} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {getInitials(user.fullName || user.name)}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 500 }}>{user.fullName || user.name || '---'}</td>
                      <td>{user.email || '---'}</td>
                      <td>{user.phone || user.phoneNumber || '---'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <select
                          className={styles.roleSelect}
                          value={user.role || 'CUSTOMER'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={roleChanging === user.id}
                        >
                          <option value="CUSTOMER">Khách hàng</option>
                          <option value="STAFF">Nhân viên</option>
                          <option value="ADMIN">Quản trị viên</option>
                        </select>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            user.enabled !== false ? styles.badgeActive : styles.badgeLocked
                          }`}
                        >
                          {user.enabled !== false ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`${styles.toggleBtn} ${
                            user.enabled !== false ? styles.toggleBtnLock : styles.toggleBtnUnlock
                          }`}
                          onClick={() => setConfirmTarget(user)}
                        >
                          {user.enabled !== false ? (
                            <>
                              <HiLockClosed style={{ marginRight: 4, verticalAlign: 'middle' }} />
                              Khóa
                            </>
                          ) : (
                            <>
                              <HiLockOpen style={{ marginRight: 4, verticalAlign: 'middle' }} />
                              Mở khóa
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.pageBtn} ${page === i ? styles.pageBtnActive : ''}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmTarget && (
        <div className={styles.modalOverlay} onClick={() => setConfirmTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {confirmTarget.enabled !== false ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </h2>
              <button className={styles.modalClose} onClick={() => setConfirmTarget(null)}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                {confirmTarget.enabled !== false ? (
                  <>
                    Bạn có chắc chắn muốn khóa tài khoản của{' '}
                    <strong>{confirmTarget.fullName || confirmTarget.name}</strong>? Khách hàng sẽ
                    không thể đăng nhập sau khi bị khóa.
                  </>
                ) : (
                  <>
                    Bạn có muốn mở khóa tài khoản của{' '}
                    <strong>{confirmTarget.fullName || confirmTarget.name}</strong>?
                  </>
                )}
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setConfirmTarget(null)}>
                Hủy
              </button>
              {confirmTarget.enabled !== false ? (
                <button className={styles.btnDanger} onClick={handleToggleStatus} disabled={toggling}>
                  {toggling ? 'Đang xử lý...' : 'Khóa tài khoản'}
                </button>
              ) : (
                <button className={styles.btnPrimary} onClick={handleToggleStatus} disabled={toggling}>
                  {toggling ? 'Đang xử lý...' : 'Mở khóa'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
