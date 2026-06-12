import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlinePaperAirplane,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import contactService from '../services/contactService';
import styles from './Contact.module.css';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSubmitting(true);
    try {
      await contactService.sendMessage(form);
      toast.success('Đã gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.pageTitle}>Liên hệ</h1>
          <p className={styles.subtitle}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua bất kỳ
            kênh nào dưới đây.
          </p>
        </motion.div>

        <div className={styles.contactLayout}>
          {/* Contact Form */}
          <motion.div
            className={styles.formSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className={styles.sectionTitle}>Gửi tin nhắn</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ tên</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Chủ đề</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Nhập chủ đề"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nội dung</label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Nhập nội dung tin nhắn"
                />
              </div>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? (
                  'Đang gửi...'
                ) : (
                  <>
                    Gửi tin nhắn
                    <HiOutlinePaperAirplane />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className={styles.infoSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className={styles.sectionTitle}>Thông tin liên hệ</h2>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <HiOutlineLocationMarker />
                </div>
                <div>
                  <h3 className={styles.infoLabel}>Địa chỉ</h3>
                  <p className={styles.infoValue}>
                    268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <HiOutlinePhone />
                </div>
                <div>
                  <h3 className={styles.infoLabel}>Điện thoại</h3>
                  <p className={styles.infoValue}>028 3863 2052</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <HiOutlineMail />
                </div>
                <div>
                  <h3 className={styles.infoLabel}>Email</h3>
                  <p className={styles.infoValue}>support@bookstorm.vn</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <HiOutlineClock />
                </div>
                <div>
                  <h3 className={styles.infoLabel}>Giờ làm việc</h3>
                  <p className={styles.infoValue}>
                    Thứ 2 - Thứ 7: 8:00 - 21:00
                  </p>
                  <p className={styles.infoValue}>
                    Chủ nhật: 9:00 - 18:00
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className={styles.mapPlaceholder}>
              <HiOutlineLocationMarker className={styles.mapIcon} />
              <span>Bản đồ</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
