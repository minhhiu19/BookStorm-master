-- ============================================================
-- BookStorm Database Migration
-- Migrated from WearOra (clothing e-commerce) -> BookStorm (book e-commerce)
-- Database: bookstorm_db
-- Charset: utf8mb4
-- Engine: InnoDB
-- ============================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ============================================================
-- Create and use database
-- ============================================================

DROP DATABASE IF EXISTS `bookstorm_db`;
CREATE DATABASE `bookstorm_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bookstorm_db`;

-- ============================================================
-- Table: users
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `enabled` bit(1) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` enum('CUSTOMER','ADMIN','STAFF') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: addresses
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address_detail` varchar(255) NOT NULL,
  `district` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `is_default` bit(1) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `province` varchar(255) NOT NULL,
  `ward` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_addresses_user` (`user_id`),
  CONSTRAINT `FK_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: categories
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_categories_slug` (`slug`),
  KEY `FK_categories_parent` (`parent_id`),
  CONSTRAINT `FK_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: books
-- (replaces products table - book-specific schema)
-- ============================================================

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `author` varchar(255) NOT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `publish_year` int DEFAULT NULL,
  `page_count` int DEFAULT NULL,
  `stock_quantity` int NOT NULL DEFAULT 0,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `featured` bit(1) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `category_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_books_slug` (`slug`),
  UNIQUE KEY `UK_books_isbn` (`isbn`),
  KEY `FK_books_category` (`category_id`),
  CONSTRAINT `FK_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: book_images
-- (replaces product_images - FK changed to book_id)
-- ============================================================

DROP TABLE IF EXISTS `book_images`;
CREATE TABLE `book_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) NOT NULL,
  `is_primary` bit(1) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `book_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_book_images_book` (`book_id`),
  CONSTRAINT `FK_book_images_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: carts
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_carts_user` (`user_id`),
  CONSTRAINT `FK_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: cart_items
-- (removed variant_id; product_id -> book_id)
-- ============================================================

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `cart_id` bigint NOT NULL,
  `book_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_cart_items_cart` (`cart_id`),
  KEY `FK_cart_items_book` (`book_id`),
  CONSTRAINT `FK_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  CONSTRAINT `FK_cart_items_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: coupons
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` enum('PERCENTAGE','FIXED') NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `min_order_amount` decimal(12,2) DEFAULT NULL,
  `start_date` datetime(6) NOT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_coupons_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: orders
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `discount_amount` decimal(12,2) DEFAULT NULL,
  `final_amount` decimal(12,2) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `order_code` varchar(255) NOT NULL,
  `payment_method` enum('COD','VNPAY') NOT NULL,
  `payment_status` enum('PENDING','PAID','REFUNDED') NOT NULL,
  `shipping_address` text,
  `shipping_fee` decimal(12,2) DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED','RETURNED') NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_orders_order_code` (`order_code`),
  KEY `FK_orders_user` (`user_id`),
  CONSTRAINT `FK_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: order_items
-- (removed size, color, variant_id; product_id -> book_id)
-- ============================================================

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `price` decimal(12,2) NOT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `order_id` bigint NOT NULL,
  `book_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_order_items_order` (`order_id`),
  KEY `FK_order_items_book` (`book_id`),
  CONSTRAINT `FK_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FK_order_items_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: payments
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` varchar(255) NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `vnpay_response_code` varchar(255) DEFAULT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_payments_order` (`order_id`),
  CONSTRAINT `FK_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: shippings
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `shippings`;
CREATE TABLE `shippings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `carrier` varchar(255) DEFAULT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `estimated_delivery` datetime(6) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `shipped_at` datetime(6) DEFAULT NULL,
  `status` enum('PENDING','PICKED_UP','IN_TRANSIT','DELIVERED','FAILED') NOT NULL,
  `tracking_code` varchar(255) DEFAULT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_shippings_order` (`order_id`),
  CONSTRAINT `FK_shippings_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: returns
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `returns`;
CREATE TABLE `returns` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `processed_at` datetime(6) DEFAULT NULL,
  `reason` text NOT NULL,
  `refund_amount` decimal(12,2) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED') NOT NULL,
  `order_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_returns_order` (`order_id`),
  KEY `FK_returns_user` (`user_id`),
  CONSTRAINT `FK_returns_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FK_returns_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: reviews
-- (product_id -> book_id)
-- ============================================================

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` text,
  `created_at` datetime(6) DEFAULT NULL,
  `rating` int NOT NULL,
  `visible` bit(1) DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  `book_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_reviews_order` (`order_id`),
  KEY `FK_reviews_book` (`book_id`),
  KEY `FK_reviews_user` (`user_id`),
  CONSTRAINT `FK_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FK_reviews_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  CONSTRAINT `FK_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: wishlists
-- (product_id -> book_id)
-- ============================================================

DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `book_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_wishlists_user_book` (`user_id`,`book_id`),
  KEY `FK_wishlists_book` (`book_id`),
  CONSTRAINT `FK_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_wishlists_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: notifications
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `message` text NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('ORDER','PROMOTION','SYSTEM') NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_notifications_user` (`user_id`),
  CONSTRAINT `FK_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: contact_messages
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('NEW','READ','REPLIED') NOT NULL,
  `subject` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: banners
-- (unchanged from WearOra)
-- ============================================================

DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: shipping_configs
-- (new table for shipping configuration)
-- ============================================================

DROP TABLE IF EXISTS `shipping_configs`;
CREATE TABLE `shipping_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `base_fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `free_shipping_threshold` decimal(12,2) DEFAULT NULL,
  `active` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

-- ============================================================
-- Users: admin@bookstorm.com (ADMIN), staff@bookstorm.com (STAFF), mai@gmail.com (CUSTOMER)
-- Password: password123 -> bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================================

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1, NULL, '2026-04-01 08:00:00.000000', 'admin@bookstorm.com',  _binary '', 'Nguyễn Văn Admin',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000001', 'ADMIN',    '2026-04-01 08:00:00.000000'),
(2, NULL, '2026-04-01 08:00:01.000000', 'staff@bookstorm.com',  _binary '', 'Trần Thị Staff',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000002', 'STAFF',     '2026-04-01 08:00:01.000000'),
(3, NULL, '2026-04-01 08:00:02.000000', 'mai@gmail.com',        _binary '', 'Phạm Thị Mai',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0912345678', 'CUSTOMER',  '2026-04-01 08:00:02.000000');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Categories: 10 book categories
-- ============================================================

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(1,  _binary '', '2026-04-01 08:01:00.000000', 'Tiểu thuyết, truyện ngắn, thơ ca Việt Nam và thế giới', NULL, 'Văn học',      'van-hoc',      NULL),
(2,  _binary '', '2026-04-01 08:01:01.000000', 'Sách kinh doanh, tài chính, đầu tư',                     NULL, 'Kinh tế',      'kinh-te',      NULL),
(3,  _binary '', '2026-04-01 08:01:02.000000', 'Kỹ năng mềm, phát triển bản thân, tư duy',               NULL, 'Kỹ năng sống', 'ky-nang-song', NULL),
(4,  _binary '', '2026-04-01 08:01:03.000000', 'Sách truyện tranh, truyện thiếu nhi',                    NULL, 'Thiếu nhi',    'thieu-nhi',    NULL),
(5,  _binary '', '2026-04-01 08:01:04.000000', 'Khoa học tự nhiên, vật lý, hóa học, sinh học',           NULL, 'Khoa học',     'khoa-hoc',     NULL),
(6,  _binary '', '2026-04-01 08:01:05.000000', 'Giáo trình đại học, cao đẳng, phổ thông',                NULL, 'Giáo trình',   'giao-trinh',   NULL),
(7,  _binary '', '2026-04-01 08:01:06.000000', 'Truyện tranh manga, comic trong và ngoài nước',          NULL, 'Truyện tranh', 'truyen-tranh', NULL),
(8,  _binary '', '2026-04-01 08:01:07.000000', 'Tâm lý học, sức khỏe tinh thần',                        NULL, 'Tâm lý',       'tam-ly',       NULL),
(9,  _binary '', '2026-04-01 08:01:08.000000', 'Lịch sử Việt Nam và thế giới',                          NULL, 'Lịch sử',      'lich-su',      NULL),
(10, _binary '', '2026-04-01 08:01:09.000000', 'Lập trình, công nghệ thông tin, AI',                     NULL, 'Công nghệ',    'cong-nghe',    NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Books: 12 sample Vietnamese books
-- ============================================================

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` (`id`, `active`, `base_price`, `author`, `publisher`, `isbn`, `publish_year`, `page_count`, `stock_quantity`, `created_at`, `description`, `featured`, `name`, `sale_price`, `slug`, `updated_at`, `category_id`) VALUES
(1,  _binary '', 45000.00,  'Nam Cao',               'NXB Văn học',          '9786041038011', 1941, 180,  150, '2026-04-01 08:02:00.000000', 'Chí Phèo là kiệt tác của nhà văn Nam Cao, kể về cuộc đời bi kịch của người nông dân bị tha hóa dưới chế độ phong kiến nửa thực dân.', _binary '', 'Chí Phèo', 39000.00, 'chi-pheo', '2026-04-01 08:02:00.000000', 1),
(2,  _binary '', 85000.00,  'Nguyễn Du',             'NXB Văn học',          '9786041038012', 1820, 320,  200, '2026-04-01 08:02:01.000000', 'Truyện Kiều là tác phẩm văn học chữ Nôm nổi tiếng nhất của Việt Nam, kể về cuộc đời tài hoa bạc mệnh của nàng Vương Thúy Kiều.', _binary '', 'Truyện Kiều', NULL, 'truyen-kieu', '2026-04-01 08:02:01.000000', 1),
(3,  _binary '', 120000.00, 'Robert T. Kiyosaki',    'NXB Trẻ',              '9786041038013', 1997, 336,  180, '2026-04-01 08:02:02.000000', 'Cha Giàu Cha Nghèo - cuốn sách tài chính cá nhân bán chạy nhất mọi thời đại, thay đổi cách nhìn về tiền bạc và đầu tư.', _binary '', 'Cha Giàu Cha Nghèo', 99000.00, 'cha-giau-cha-ngheo', '2026-04-01 08:02:02.000000', 2),
(4,  _binary '', 95000.00,  'Dale Carnegie',         'NXB Tổng hợp TP.HCM',  '9786041038014', 1936, 320,  220, '2026-04-01 08:02:03.000000', 'Đắc Nhân Tâm - nghệ thuật thu phục lòng người, một trong những cuốn sách self-help bán chạy nhất thế giới với hơn 30 triệu bản.', _binary '', 'Đắc Nhân Tâm', NULL, 'dac-nhan-tam', '2026-04-01 08:02:03.000000', 3),
(5,  _binary '', 110000.00, 'Rhonda Byrne',          'NXB Trẻ',              '9786041038015', 2006, 216,  300, '2026-04-01 08:02:04.000000', 'Bí Mật - khám phá sức mạnh của luật hấp dẫn, giúp bạn thay đổi cuộc sống theo hướng tích cực và đạt được mọi điều mơ ước.', _binary '', 'Bí Mật (The Secret)', 89000.00, 'bi-mat-the-secret', '2026-04-01 08:02:04.000000', 3),
(6,  _binary '', 89000.00,  'Tô Hoài',               'NXB Kim Đồng',         '9786041038016', 1941, 120,  250, '2026-04-01 08:02:05.000000', 'Dế Mèn Phiêu Lưu Ký - tác phẩm thiếu nhi kinh điển của Việt Nam, kể về hành trình phiêu lưu đầy thú vị của chú dế Mèn.', _binary '', 'Dế Mèn Phiêu Lưu Ký', NULL, 'de-men-phieu-luu-ky', '2026-04-01 08:02:05.000000', 4),
(7,  _binary '', 75000.00,  'Stephen Hawking',       'NXB Trẻ',              '9786041038017', 1988, 212,  120, '2026-04-01 08:02:06.000000', 'Lược Sử Thời Gian - giải thích vũ trụ học một cách dễ hiểu, từ Big Bang đến lỗ đen, bán được hơn 10 triệu bản trên toàn thế giới.', _binary '', 'Lược Sử Thời Gian', 65000.00, 'luoc-su-thoi-gian', '2026-04-01 08:02:06.000000', 5),
(8,  _binary '', 130000.00, 'Yuval Noah Harari',     'NXB Thế giới',         '9786041038018', 2011, 512,  90,  '2026-04-01 08:02:07.000000', 'Sapiens: Lược Sử Loài Người - cuốn sách trình bày lịch sử tiến hóa của loài người từ thời tiền sử đến hiện đại một cách hấp dẫn.', _binary '', 'Sapiens: Lược Sử Loài Người', NULL, 'sapiens-luoc-su-loai-nguoi', '2026-04-01 08:02:07.000000', 9),
(9,  _binary '', 78000.00,  'Nguyễn Nhật Ánh',       'NXB Trẻ',              '9786041038019', 2008, 264,  500, '2026-04-01 08:02:08.000000', 'Cho Tôi Xin Một Vé Đi Tuổi Thơ - tác phẩm đưa người đọc trở về thế giới tuổi thơ trong sáng, hồn nhiên và đầy ắp kỷ niệm.', _binary '', 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', NULL, 'cho-toi-xin-mot-ve-di-tuoi-tho', '2026-04-01 08:02:08.000000', 1),
(10, _binary '', 145000.00, 'Erich Fromm',           'NXB Văn học',          '9786041038020', 1956, 176,  80,  '2026-04-01 08:02:09.000000', 'Nghệ Thuật Yêu - khám phá tình yêu không phải là cảm xúc mà là một nghệ thuật cần học hỏi, một trong những cuốn sách tâm lý kinh điển.', _binary '', 'Nghệ Thuật Yêu', 120000.00, 'nghe-thuat-yeu', '2026-04-01 08:02:09.000000', 8),
(11, _binary '', 99000.00,  'Osamu Tezuka',          'NXB Kim Đồng',         '9786041038021', 1952, 400,  350, '2026-04-01 08:02:10.000000', 'Astro Boy - bộ truyện tranh kinh điển về chú robot nhí Astro Boy chiến đấu bảo vệ hòa bình thế giới của cha đẻ manga hiện đại.', _binary '', 'Astro Boy', NULL, 'astro-boy', '2026-04-01 08:02:10.000000', 7),
(12, _binary '', 199000.00, 'Andrew Hunt & David Thomas', 'NXB Thông tin & Truyền thông', '9786041038022', 1999, 352, 60, '2026-04-01 08:02:11.000000', 'Lập Trình Viên Thực Dụng - cuốn sách kinh điển dành cho lập trình viên, hướng dẫn cách viết code chất lượng và tư duy như một chuyên gia.', _binary '', 'Lập Trình Viên Thực Dụng', 169000.00, 'lap-trinh-vien-thuc-dung', '2026-04-01 08:02:11.000000', 10);
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Book images: 12 placeholder images (one per book)
-- ============================================================

LOCK TABLES `book_images` WRITE;
/*!40000 ALTER TABLE `book_images` DISABLE KEYS */;
INSERT INTO `book_images` VALUES
(1,  'https://via.placeholder.com/400x600.png?text=Chi+Pheo',           _binary '',    0, 1),
(2,  'https://via.placeholder.com/400x600.png?text=Truyen+Kieu',        _binary '',    0, 2),
(3,  'https://via.placeholder.com/400x600.png?text=Cha+Giau+Cha+Ngheo', _binary '',    0, 3),
(4,  'https://via.placeholder.com/400x600.png?text=Dac+Nhan+Tam',       _binary '',    0, 4),
(5,  'https://via.placeholder.com/400x600.png?text=Bi+Mat',             _binary '',    0, 5),
(6,  'https://via.placeholder.com/400x600.png?text=De+Men+Phieu+Luu+Ky',_binary '',    0, 6),
(7,  'https://via.placeholder.com/400x600.png?text=Luoc+Su+Thoi+Gian',  _binary '',    0, 7),
(8,  'https://via.placeholder.com/400x600.png?text=Sapiens',            _binary '',    0, 8),
(9,  'https://via.placeholder.com/400x600.png?text=Ve+Di+Tuoi+Tho',     _binary '',    0, 9),
(10, 'https://via.placeholder.com/400x600.png?text=Nghe+Thuat+Yeu',     _binary '',    0, 10),
(11, 'https://via.placeholder.com/400x600.png?text=Astro+Boy',          _binary '',    0, 11),
(12, 'https://via.placeholder.com/400x600.png?text=Lap+Trinh+Vien',     _binary '',    0, 12);
/*!40000 ALTER TABLE `book_images` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Coupons: WELCOME10, SACH50K, FREESHIP
-- ============================================================

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES
(1, _binary '', 'WELCOME10', 'Giảm 10% cho đơn hàng đầu tiên',   'PERCENTAGE', 10.00,    '2027-12-31 23:59:59.000000', 50000.00,  100000.00, '2026-04-01 00:00:00.000000', 100, 0),
(2, _binary '', 'SACH50K',   'Giảm 50.000đ cho đơn mua sách',    'FIXED',      50000.00,  '2027-12-31 23:59:59.000000', NULL,       200000.00, '2026-04-01 00:00:00.000000', 50,  0),
(3, _binary '', 'FREESHIP',  'Miễn phí vận chuyển toàn quốc',    'FIXED',      30000.00,  '2027-12-31 23:59:59.000000', NULL,       0.00,      '2026-04-01 00:00:00.000000', 200, 0);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Banners: 3 banners for BookStorm
-- ============================================================

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES
(1, _binary '', '2026-04-01 08:05:00.000000', 'https://via.placeholder.com/1200x400.png?text=BookStorm+Banner+1', '/shop',             1, 'Khám Phá Kho Sách Khổng Lồ'),
(2, _binary '', '2026-04-01 08:05:01.000000', 'https://via.placeholder.com/1200x400.png?text=BookStorm+Banner+2', '/shop?sale=true',   2, 'Sale Sách - Giảm Đến 40%'),
(3, _binary '', '2026-04-01 08:05:02.000000', 'https://via.placeholder.com/1200x400.png?text=BookStorm+Banner+3', '/shop?featured=true', 3, 'Sách Bán Chạy Nhất Tháng');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Shipping config: 1 default config
-- ============================================================

LOCK TABLES `shipping_configs` WRITE;
/*!40000 ALTER TABLE `shipping_configs` DISABLE KEYS */;
INSERT INTO `shipping_configs` VALUES
(1, 'Giao Hàng Nhanh (GHN)', 30000.00, 300000.00, _binary '', '2026-04-01 08:06:00.000000', '2026-04-01 08:06:00.000000');
/*!40000 ALTER TABLE `shipping_configs` ENABLE KEYS */;
UNLOCK TABLES;

-- ============================================================
-- Restore settings
-- ============================================================

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- BookStorm database migration completed successfully
-- Generated: 2026-04-01
