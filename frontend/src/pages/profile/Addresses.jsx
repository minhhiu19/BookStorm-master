import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLocationMarker,
  HiOutlineX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import axios from 'axios';
import userService from '../../services/userService';
import styles from './Addresses.module.css';

const PROVINCES_API = 'https://provinces.open-api.vn/api';

const INITIAL_FORM = {
  fullName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  addressDetail: '',
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getAddresses();
      setAddresses(response.data || []);
    } catch {
      toast.error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get(`${PROVINCES_API}/p/`);
        setProvinces(res.data || []);
      } catch { /* silent */ }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvinceCode) { setDistricts([]); setWards([]); return; }
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${PROVINCES_API}/p/${selectedProvinceCode}?depth=2`);
        setDistricts(res.data?.districts || []);
        setWards([]);
        setSelectedDistrictCode('');
        setForm(prev => ({ ...prev, district: '', ward: '' }));
      } catch { setDistricts([]); }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!selectedDistrictCode) { setWards([]); return; }
    const fetchWards = async () => {
      try {
        const res = await axios.get(`${PROVINCES_API}/d/${selectedDistrictCode}?depth=2`);
        setWards(res.data?.wards || []);
        setForm(prev => ({ ...prev, ward: '' }));
      } catch { setWards([]); }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const province = provinces.find(p => String(p.code) === code);
    setForm(prev => ({ ...prev, province: province?.name || '' }));
  };

  const handleDistrictChange = (e) => {
    const code = e.target.value;
    setSelectedDistrictCode(code);
    const district = districts.find(d => String(d.code) === code);
    setForm(prev => ({ ...prev, district: district?.name || '' }));
  };

  const handleWardChange = (e) => {
    const code = e.target.value;
    const ward = wards.find(w => String(w.code) === code);
    setForm(prev => ({ ...prev, ward: ward?.name || '' }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');
    setDistricts([]);
    setWards([]);
    setShowModal(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr.id);
    setForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      province: addr.province || '',
      district: addr.district || '',
      ward: addr.ward || '',
      addressDetail: addr.addressDetail || '',
    });
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');
    setDistricts([]);
    setWards([]);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const { fullName, phone, province, district, ward, addressDetail } = form;
    if (!fullName || !phone || !province || !district || !ward || !addressDetail) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await userService.updateAddress(editingId, form);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await userService.addAddress(form);
        toast.success('Thêm địa chỉ thành công');
      }
      setShowModal(false);
      fetchAddresses();
    } catch {
      toast.error('Không thể lưu địa chỉ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await userService.deleteAddress(id);
      toast.success('Đã xóa địa chỉ');
      fetchAddresses();
    } catch {
      toast.error('Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await userService.setDefaultAddress(id);
      toast.success('Đã thiết lập địa chỉ mặc định');
      fetchAddresses();
    } catch {
      toast.error('Không thể thiết lập địa chỉ mặc định');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.headerRow}>
        <h2 className={styles.contentTitle}>Địa chỉ của tôi</h2>
        <button className={styles.addBtn} onClick={openAddModal}>
          <HiOutlinePlus />
          Thêm địa chỉ
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className={styles.emptyState}>
          <HiOutlineLocationMarker className={styles.emptyIcon} />
          <p>Bạn chưa có địa chỉ nào</p>
          <button className={styles.addBtnEmpty} onClick={openAddModal}>
            Thêm địa chỉ mới
          </button>
        </div>
      ) : (
        <div className={styles.addressList}>
          {addresses.map((addr) => (
            <div key={addr.id} className={styles.addressCard}>
              <div className={styles.addressInfo}>
                <div className={styles.addressTop}>
                  <span className={styles.addressName}>{addr.fullName}</span>
                  <span className={styles.addressPhone}>{addr.phone}</span>
                  {addr.isDefault && (
                    <span className={styles.defaultBadge}>Mặc định</span>
                  )}
                </div>
                <p className={styles.addressDetail}>
                  {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.province}
                </p>
              </div>
              <div className={styles.addressActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => openEditModal(addr)}
                >
                  <HiOutlinePencil />
                  Sửa
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(addr.id)}
                >
                  <HiOutlineTrash />
                  Xóa
                </button>
                {!addr.isDefault && (
                  <button
                    className={styles.defaultBtn}
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    Đặt làm mặc định
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  {editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
                </h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowModal(false)}
                >
                  <HiOutlineX />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Họ tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tỉnh/Thành phố</label>
                    <select className={styles.selectInput} value={selectedProvinceCode} onChange={handleProvinceChange}>
                      <option value="">{form.province || '-- Chọn tỉnh/thành phố --'}</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Quận/Huyện</label>
                    <select className={styles.selectInput} value={selectedDistrictCode} onChange={handleDistrictChange} disabled={!selectedProvinceCode}>
                      <option value="">{form.district || '-- Chọn quận/huyện --'}</option>
                      {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phường/Xã</label>
                    <select className={styles.selectInput} value={wards.find(w => w.name === form.ward)?.code || ''} onChange={handleWardChange} disabled={!selectedDistrictCode}>
                      <option value="">{form.ward || '-- Chọn phường/xã --'}</option>
                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>Địa chỉ chi tiết</label>
                    <input
                      type="text"
                      name="addressDetail"
                      value={form.addressDetail}
                      onChange={handleChange}
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelModalBtn}
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button
                  className={styles.saveModalBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Addresses;
