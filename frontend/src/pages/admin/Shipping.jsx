import React, { useState, useEffect, useCallback } from 'react';
import { HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminService from '../../services/adminService';
import styles from './Shipping.module.css';

const SHIPPING_STATUS_MAP = {
  PENDING: { label: 'Chờ lấy hàng', className: 'badgePending' },
  PICKED_UP: { label: 'Đã lấy hàng', className: 'badgePicked' },
  IN_TRANSIT: { label: 'Đang vận chuyển', className: 'badgeInTransit' },
  DELIVERED: { label: 'Đã giao', className: 'badgeDelivered' },
  FAILED: { label: 'Giao thất bại', className: 'badgeFailed' },
};

const DEFAULT_CONFIG = {
  defaultFee: 30000,
  freeThreshold: 500000,
  carriers: ['GHN', 'GHTK', 'J&T Express', 'Viettel Post'],
};

const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

function Shipping() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    trackingCode: '',
    carrier: '',
    status: 'PENDING',
    note: '',
  });
  const [saving, setSaving] = useState(false);

  const [showConfig, setShowConfig] = useState(false);
  const [shippingConfig, setShippingConfig] = useState(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(false);
  const [newCarrier, setNewCarrier] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrders(page, 20, 'SHIPPING');
      const data = res.data || res;
      setOrders(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách vận chuyển');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await adminService.getShippingConfig();
        const data = res.data || res;
        if (data) {
          setShippingConfig({
            defaultFee: data.defaultFee || 30000,
            freeThreshold: data.freeThreshold || 500000,
            carriers: data.carriers || DEFAULT_CONFIG.carriers,
          });
        }
      } catch {
        // Use defaults if API fails
      }
    };
    fetchConfig();
  }, []);

  const openShippingModal = (order) => {
    setSelectedOrder(order);
    setShippingForm({
      trackingCode: order.trackingCode || order.shipping?.trackingCode || '',
      carrier: order.carrier || order.shipping?.carrier || '',
      status: order.shippingStatus || order.shipping?.status || 'PENDING',
      note: order.shippingNote || order.shipping?.note || '',
    });
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleFormChange = (field, value) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedOrder) return;

    if (shippingForm.status === 'FAILED' && !shippingForm.note.trim()) {
      toast.error('Vui lòng nhập lý do giao hàng thất bại');
      return;
    }

    try {
      setSaving(true);
      // Try to get existing shipping or create new one
      try {
        const existingShipping = await adminService.getShippingByOrder(selectedOrder.orderCode);
        const shippingData = existingShipping.data || existingShipping;
        if (shippingData && shippingData.id) {
          await adminService.updateShippingStatus(shippingData.id, shippingForm);
        } else {
          await adminService.createShipping(selectedOrder.orderCode, shippingForm);
        }
      } catch {
        await adminService.createShipping(selectedOrder.orderCode, shippingForm);
      }
      toast.success('Cập nhật thông tin vận chuyển thành công');
      closeModal();
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
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

  const handleConfigChange = (field, value) => {
    setShippingConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCarrier = () => {
    if (newCarrier.trim() && !shippingConfig.carriers.includes(newCarrier.trim())) {
      setShippingConfig((prev) => ({
        ...prev,
        carriers: [...prev.carriers, newCarrier.trim()],
      }));
      setNewCarrier('');
    }
  };

  const handleRemoveCarrier = (carrier) => {
    setShippingConfig((prev) => ({
      ...prev,
      carriers: prev.carriers.filter((c) => c !== carrier),
    }));
  };

  const handleSaveConfig = async () => {
    try {
      setConfigLoading(true);
      await adminService.updateShippingConfig(shippingConfig);
      toast.success('Đã lưu cấu hình vận chuyển');
      setShowConfig(false);
    } catch {
      toast.error('Không thể lưu cấu hình');
    } finally {
      setConfigLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Quản lý vận chuyển</h1>
        <button className={styles.configToggle} onClick={() => setShowConfig(!showConfig)}>
          {showConfig ? 'Ẩn cấu hình' : 'Cấu hình'}
        </button>
      </div>

      {showConfig && (
        <div className={styles.configSection}>
          <h3 className={styles.configTitle}>Cấu hình vận chuyển</h3>

          <div className={styles.configGrid}>
            <div className={styles.configGroup}>
              <label className={styles.configLabel}>Phí vận chuyển mặc định (VND)</label>
              <input
                type="number"
                className={styles.configInput}
                value={shippingConfig.defaultFee}
                onChange={(e) => handleConfigChange('defaultFee', Number(e.target.value))}
                placeholder="30000"
              />
            </div>

            <div className={styles.configGroup}>
              <label className={styles.configLabel}>Miễn phí ship cho đơn từ (VND)</label>
              <input
                type="number"
                className={styles.configInput}
                value={shippingConfig.freeThreshold}
                onChange={(e) => handleConfigChange('freeThreshold', Number(e.target.value))}
                placeholder="500000"
              />
            </div>
          </div>

          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Đơn vị vận chuyển</label>
            <div className={styles.carriersList}>
              {shippingConfig.carriers.map((carrier) => (
                <span key={carrier} className={styles.carrierTag}>
                  {carrier}
                  <button
                    className={styles.carrierRemove}
                    onClick={() => handleRemoveCarrier(carrier)}
                    title="Xóa"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className={styles.addCarrierRow}>
              <input
                type="text"
                className={styles.addCarrierInput}
                value={newCarrier}
                onChange={(e) => setNewCarrier(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCarrier()}
                placeholder="Nhập tên đơn vị vận chuyển mới"
              />
              <button className={styles.addCarrierBtn} onClick={handleAddCarrier}>
                Thêm
              </button>
            </div>
          </div>

          <div className={styles.configActions}>
            <button className={styles.btnPrimary} onClick={handleSaveConfig} disabled={configLoading}>
              {configLoading ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Đang tải...
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>Không có đơn hàng cần vận chuyển</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Địa chỉ</th>
                    <th>Mã vận đơn</th>
                    <th>Đơn vị VC</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const shippingStatus = order.shippingStatus || order.shipping?.status || 'PENDING';
                    const statusInfo = SHIPPING_STATUS_MAP[shippingStatus] || SHIPPING_STATUS_MAP.PENDING;
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 500 }}>{order.orderCode || `#${order.id}`}</td>
                        <td>{order.customerName || order.user?.fullName || '---'}</td>
                        <td>
                          <span className={styles.address} title={order.shippingAddress || order.address?.fullAddress}>
                            {order.shippingAddress || order.address?.fullAddress || '---'}
                          </span>
                        </td>
                        <td>
                          <span className={styles.trackingCode}>
                            {order.trackingCode || order.shipping?.trackingCode || '---'}
                          </span>
                        </td>
                        <td>{order.carrier || order.shipping?.carrier || '---'}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[statusInfo.className]}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>
                          <button className={styles.viewBtn} onClick={() => openShippingModal(order)}>
                            Cập nhật
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Shipping Update Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Cập nhật vận chuyển - {selectedOrder.orderCode || `#${selectedOrder.id}`}
              </h2>
              <button className={styles.modalClose} onClick={closeModal}>
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mã vận đơn</label>
                <input
                  className={styles.formInput}
                  value={shippingForm.trackingCode}
                  onChange={(e) => handleFormChange('trackingCode', e.target.value)}
                  placeholder="Nhập mã vận đơn"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Đơn vị vận chuyển</label>
                <input
                  className={styles.formInput}
                  value={shippingForm.carrier}
                  onChange={(e) => handleFormChange('carrier', e.target.value)}
                  placeholder="VD: GHN, GHTK, J&T, Viettel Post..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Trạng thái vận chuyển</label>
                <select
                  className={styles.formSelect}
                  value={shippingForm.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <option value="PENDING">Chờ lấy hàng</option>
                  <option value="PICKED_UP">Đã lấy hàng</option>
                  <option value="IN_TRANSIT">Đang vận chuyển</option>
                  <option value="DELIVERED">Đã giao</option>
                  <option value="FAILED">Giao thất bại</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {shippingForm.status === 'FAILED' ? 'Lý do giao thất bại *' : 'Ghi chú'}
                </label>
                <textarea
                  className={styles.formTextarea}
                  value={shippingForm.note}
                  onChange={(e) => handleFormChange('note', e.target.value)}
                  placeholder={shippingForm.status === 'FAILED'
                    ? 'Nhập lý do giao hàng thất bại (bắt buộc)...'
                    : 'Ghi chú vận chuyển...'}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeModal}>
                Hủy
              </button>
              <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shipping;
