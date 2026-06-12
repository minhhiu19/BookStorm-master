-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: wearora_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  KEY `FK1fa36y2oqhao3wgg2rw1pi459` (`user_id`),
  CONSTRAINT `FK1fa36y2oqhao3wgg2rw1pi459` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,'Số 15, ngõ 42, Phố Trần Thái Tông','Cầu Giấy','Phạm Thị Mai',_binary '','0912345678','Hà Nội','Dịch Vọng Hậu',4),(2,'Số 8, Phố Tràng Tiền','Hoàn Kiếm','Phạm Thị Mai',_binary '\0','0912345678','Hà Nội','Tràng Tiền',4),(3,'25 Lê Lợi, Phường Bến Nghé','Quận 1','Hoàng Văn Đức',_binary '','0923456789','TP. Hồ Chí Minh','Bến Nghé',5),(4,'120 Nguyễn Văn Linh','Hải Châu','Nguyễn Thị Lan',_binary '','0934567890','Đà Nẵng','Thanh Khê Đông',6),(5,'45 Phạm Văn Đồng','Sơn Trà','Nguyễn Thị Lan',_binary '\0','0934567890','Đà Nẵng','An Hải Bắc',6),(6,'Số 10 Nguyễn Văn Linh, Khu Phú Mỹ Hưng','Quận 7','Vũ Minh Tuấn',_binary '','0945678901','TP. Hồ Chí Minh','Tân Phong',7),(7,'Chung cư Hapulico, 83 Vũ Trọng Phụng','Thanh Xuân','Đặng Thùy Linh',_binary '','0956789012','Hà Nội','Khương Trung',8),(8,'1111','Quận Ba Đình','hung7',_binary '','0337878787','Thành phố Hà Nội','Phường Vĩnh Phúc',9);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,_binary '','2026-02-28 11:00:14.598778','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251214/wearora/banners/vhdguqaum5zotkko5cwl.jpg','/shop',1,'Bộ sưu tập Xuân Hè 2024'),(2,_binary '','2026-02-28 11:00:15.916490','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251215/wearora/banners/j2ay5icqbd78a91to6rp.jpg','/shop?sale=true',2,'Sale cuối mùa - Giảm đến 50%'),(3,_binary '','2026-02-28 11:00:17.071404','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251217/wearora/banners/njjpoinx846u3gslmdcv.jpg','/shop?category=ao-khoac',3,'Áo khoác mới về'),(4,_binary '','2026-02-28 11:00:18.245482','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251218/wearora/banners/uzkxdq7qfsknjzpf0r0n.jpg','/shop',4,'Miễn phí vận chuyển đơn từ 500K');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `cart_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpcttvuq4mxppo8sxggjtn5i2c` (`cart_id`),
  KEY `FK1re40cjegsfvw58xrkdp6bac6` (`product_id`),
  KEY `FK5yyw1o0dor9gmxfra1dqvn4qa` (`variant_id`),
  CONSTRAINT `FK1re40cjegsfvw58xrkdp6bac6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FK5yyw1o0dor9gmxfra1dqvn4qa` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `FKpcttvuq4mxppo8sxggjtn5i2c` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (4,1,2,30,292);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_64t7ox312pqal3p7fg9o503c2` (`user_id`),
  CONSTRAINT `FKb5o626f86h46m4s7ms6ginnop` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,'2026-02-28 11:02:23.441330','2026-02-28 11:02:23.441834',1),(2,'2026-02-28 12:49:35.256885','2026-02-28 12:49:35.256885',9),(3,'2026-02-28 15:19:00.874662','2026-02-28 15:19:00.874662',2);
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  UNIQUE KEY `UK_oul14ho7bctbefv8jywp5v3i2` (`slug`),
  KEY `FKsaok720gsu4u2wrgbk10b5n8d` (`parent_id`),
  CONSTRAINT `FKsaok720gsu4u2wrgbk10b5n8d` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,_binary '','2026-02-28 10:58:38.375037','Áo thun nam nữ đa dạng kiểu dáng','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251117/wearora/categories/iiy3kyfxduldfihsajyl.jpg','Áo thun','o-thun',NULL),(2,_binary '','2026-02-28 10:58:39.787379','Áo sơ mi thanh lịch cho mọi dịp','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251119/wearora/categories/lwpfnxyzrz5ysiydgu7p.jpg','Áo sơ mi','ao-so-mi',NULL),(3,_binary '','2026-02-28 10:58:40.889581','Áo khoác giữ ấm thời trang','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251121/wearora/categories/eo4e53ltsiaigzhpjsyb.jpg','Áo khoác','ao-khoac',NULL),(4,_binary '','2026-02-28 10:58:42.441618','Quần jean bền đẹp hợp thời trang','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251122/wearora/categories/rdivm0ww4vfy9vb3dayb.jpg','Quần jean','quan-jean',NULL),(5,_binary '','2026-02-28 10:58:43.563456','Quần tây lịch lãm công sở','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251123/wearora/categories/hoxd1dfvccsb4gn4wvfx.jpg','Quần tây','quan-tay',NULL),(6,_binary '','2026-02-28 10:58:44.687089','Váy đầm nữ tính quyến rũ','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251124/wearora/categories/xw02axkwhpd53xldjp57.jpg','Váy & Đầm','vay-dam',NULL),(7,_binary '','2026-02-28 10:58:45.775658','Phụ kiện thời trang đẳng cấp','https://res.cloudinary.com/daytrfyrg/image/upload/v1772251125/wearora/categories/gn4idaaxavmrnl51ndgr.jpg','Phụ kiện','phu-kien',NULL),(8,_binary '','2026-02-28 12:21:53.240665','','https://res.cloudinary.com/daytrfyrg/image/upload/v1772256121/wearora/categories/nxlehdmuiew6ysqfifaz.jpg','test','test',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('NEW','READ','REPLIED') NOT NULL,
  `subject` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  UNIQUE KEY `UK_eplt0kkm9yf2of2lnx6c1oy9b` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,_binary '','WELCOME101','Giảm 10% cho đơn hàng đầu tiên','PERCENTAGE',10.00,'2026-05-29 23:59:59.000000',100000.00,200000.00,'2026-02-28 00:00:00.000000',100,0),(2,_binary '','SUMMER50','Giảm 50.000đ cho mùa hè','FIXED',50000.00,'2026-05-29 11:00:18.246734',NULL,300000.00,'2026-02-28 11:00:18.246734',50,0),(3,_binary '','VIP20','Giảm 20% cho khách VIP','PERCENTAGE',20.00,'2026-05-29 11:00:18.246734',200000.00,500000.00,'2026-02-28 11:00:18.246734',30,0),(4,_binary '','FREESHIP','Miễn phí vận chuyển','FIXED',30000.00,'2026-05-29 11:00:18.246734',NULL,0.00,'2026-02-28 11:00:18.246734',200,0);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `message` text NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('ORDER','PROMOTION','SYSTEM') NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'2026-02-28 11:00:18.317792',_binary '\0','Cảm ơn bạn đã đăng ký tài khoản. Khám phá bộ sưu tập thời trang mới nhất của chúng tôi!','Chào mừng bạn đến Wearora!','SYSTEM',4),(2,'2026-02-28 11:00:18.317792',_binary '\0','Cảm ơn bạn đã đăng ký tài khoản. Khám phá bộ sưu tập thời trang mới nhất của chúng tôi!','Chào mừng bạn đến Wearora!','SYSTEM',5),(3,'2026-02-28 11:00:18.318792',_binary '\0','Cảm ơn bạn đã đăng ký tài khoản. Khám phá bộ sưu tập thời trang mới nhất của chúng tôi!','Chào mừng bạn đến Wearora!','SYSTEM',6),(4,'2026-02-28 11:00:18.318792',_binary '\0','Cảm ơn bạn đã đăng ký tài khoản. Khám phá bộ sưu tập thời trang mới nhất của chúng tôi!','Chào mừng bạn đến Wearora!','SYSTEM',7),(5,'2026-02-28 11:00:18.319793',_binary '\0','Cảm ơn bạn đã đăng ký tài khoản. Khám phá bộ sưu tập thời trang mới nhất của chúng tôi!','Chào mừng bạn đến Wearora!','SYSTEM',8),(6,'2026-02-28 11:00:18.319793',_binary '\0','Nhanh tay săn deal hời! Giảm giá lên đến 50% cho hàng nghìn sản phẩm. Sử dụng mã SUMMER50 để giảm thêm 50K.','Sale cuối mùa - Giảm đến 50%!','PROMOTION',4),(7,'2026-02-28 11:00:18.319793',_binary '\0','Nhanh tay săn deal hời! Giảm giá lên đến 50% cho hàng nghìn sản phẩm. Sử dụng mã SUMMER50 để giảm thêm 50K.','Sale cuối mùa - Giảm đến 50%!','PROMOTION',5),(8,'2026-02-28 11:00:18.319793',_binary '\0','Nhanh tay săn deal hời! Giảm giá lên đến 50% cho hàng nghìn sản phẩm. Sử dụng mã SUMMER50 để giảm thêm 50K.','Sale cuối mùa - Giảm đến 50%!','PROMOTION',6),(9,'2026-02-28 11:00:18.321296',_binary '\0','Nhanh tay săn deal hời! Giảm giá lên đến 50% cho hàng nghìn sản phẩm. Sử dụng mã SUMMER50 để giảm thêm 50K.','Sale cuối mùa - Giảm đến 50%!','PROMOTION',7),(10,'2026-02-28 11:00:18.321296',_binary '\0','Nhanh tay săn deal hời! Giảm giá lên đến 50% cho hàng nghìn sản phẩm. Sử dụng mã SUMMER50 để giảm thêm 50K.','Sale cuối mùa - Giảm đến 50%!','PROMOTION',8),(11,'2026-02-28 11:00:18.321296',_binary '','Đơn hàng WR-ORD-20240101 đã giao thành công. Cảm ơn bạn đã mua hàng!','Cập nhật đơn hàng WR-ORD-20240101','ORDER',4),(12,'2026-02-28 11:00:18.321296',_binary '','Đơn hàng WR-ORD-20240102 đã giao thành công. Cảm ơn bạn đã mua hàng!','Cập nhật đơn hàng WR-ORD-20240102','ORDER',5),(13,'2026-02-28 11:00:18.322299',_binary '\0','Đơn hàng WR-ORD-20240103 đang được vận chuyển. Dự kiến giao trong 2-3 ngày.','Cập nhật đơn hàng WR-ORD-20240103','ORDER',6),(14,'2026-02-28 11:00:18.322299',_binary '\0','Đơn hàng WR-ORD-20240104 đã được xác nhận. Chúng tôi đang chuẩn bị hàng cho bạn.','Cập nhật đơn hàng WR-ORD-20240104','ORDER',7),(15,'2026-02-28 11:00:18.322299',_binary '\0','Đơn hàng WR-ORD-20240105 đã được tiếp nhận. Vui lòng chờ xác nhận.','Cập nhật đơn hàng WR-ORD-20240105','ORDER',8),(16,'2026-02-28 11:00:18.323300',_binary '','Đơn hàng WR-ORD-20240106 đã giao thành công. Cảm ơn bạn đã mua hàng!','Cập nhật đơn hàng WR-ORD-20240106','ORDER',4);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` varchar(255) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `size` varchar(255) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  KEY `FKocimc7dtr037rh4ls4l95nlfi` (`product_id`),
  KEY `FKemq71edpbn9wsxnxncfn1algp` (`variant_id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKemq71edpbn9wsxnxncfn1algp` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,'Đen',299000.00,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop','Áo thun cổ tròn Classic',1,'S',299000.00,1,1,1),(2,'Xanh navy',399000.00,'https://images.unsplash.com/photo-1625910513413-5fc03823a43b?w=800&h=1000&fit=crop','Áo thun polo nam thanh lịch',1,'S',399000.00,1,3,25),(3,'Trắng',549000.00,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop','Áo sơ mi trắng Oxford',1,'S',549000.00,2,7,68),(4,'Đen',799000.00,'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop','Áo khoác bomber unisex',1,'M',799000.00,2,12,114),(5,'Đen',599000.00,'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop','Quần tây nữ ống đứng',2,'26',1198000.00,3,21,217),(6,'Trắng',449000.00,'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=800&h=1000&fit=crop','Váy tennis xòe',1,'S',449000.00,3,25,257),(7,'Xanh navy',599000.00,'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800&h=1000&fit=crop','Quần jean slim fit',1,'29',599000.00,4,16,155),(8,'Đen',449000.00,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop','Thắt lưng da thật',1,'F',449000.00,4,29,284),(9,'Đen',549000.00,'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop','Quần culottes nữ',1,'S',549000.00,5,23,239),(10,'Be',649000.00,'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&h=1000&fit=crop','Đầm maxi boho',2,'S',1298000.00,5,26,266),(11,'Đen',749000.00,'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop','Áo khoác blazer nữ',1,'S',749000.00,6,13,126),(12,'Trắng',289000.00,'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&h=1000&fit=crop','Áo thun in họa tiết',1,'S',289000.00,6,6,58),(13,'Be',459000.00,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251154/wearora/products/qjwxasjiaiujwwuzimiu.jpg','Áo sơ mi oversize nữ',3,'L',1377000.00,7,11,112),(14,'Trắng',459000.00,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251154/wearora/products/qjwxasjiaiujwwuzimiu.jpg','Áo sơ mi oversize nữ',1,'M',459000.00,7,11,108);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  UNIQUE KEY `UK_dhk2umg8ijjkg4njg6891trit` (`order_code`),
  KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`),
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'2026-02-28 11:00:18.253134',0.00,728000.00,'Giao giờ hành chính','WR-ORD-20240101','COD','PAID','Phạm Thị Mai, 0912345678, Số 15, ngõ 42, Phố Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',30000.00,'DELIVERED',698000.00,'2026-02-28 11:00:18.253134',4),(2,'2026-02-28 11:00:18.266402',0.00,1378000.00,NULL,'WR-ORD-20240102','VNPAY','PAID','Hoàng Văn Đức, 0923456789, 25 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',30000.00,'DELIVERED',1348000.00,'2026-02-28 11:00:18.266402',5),(3,'2026-02-28 11:00:18.270065',0.00,1672000.00,'Gọi trước khi ship','WR-ORD-20240103','COD','PENDING','Nguyễn Thị Lan, 0934567890, 120 Nguyễn Văn Linh, Thanh Khê Đông, Hải Châu, Đà Nẵng',25000.00,'SHIPPING',1647000.00,'2026-02-28 11:00:18.270065',6),(4,'2026-02-28 11:00:18.271812',0.00,1078000.00,NULL,'WR-ORD-20240104','VNPAY','PAID','Vũ Minh Tuấn, 0945678901, Số 10 Nguyễn Văn Linh, Tân Phong, Quận 7, TP. Hồ Chí Minh',30000.00,'SHIPPING',1048000.00,'2026-02-28 16:09:44.302468',7),(5,'2026-02-28 11:00:18.274548',0.00,1877000.00,NULL,'WR-ORD-20240105','COD','PENDING','Đặng Thùy Linh, 0956789012, Chung cư Hapulico, 83 Vũ Trọng Phụng, Khương Trung, Thanh Xuân, Hà Nội',30000.00,'PENDING',1847000.00,'2026-02-28 11:00:18.274548',8),(6,'2026-02-28 11:00:18.276709',0.00,1038000.00,NULL,'WR-ORD-20240106','VNPAY','PAID','Phạm Thị Mai, 0912345678, Số 15, ngõ 42, Phố Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',0.00,'CONFIRMED',1038000.00,'2026-02-28 17:13:58.767951',4),(7,'2026-02-28 14:21:34.675213',0.00,1836000.00,NULL,'WO1772263294669','COD','REFUNDED','1111, Phường Vĩnh Phúc, Quận Ba Đình, Thành phố Hà Nội, hung - 0337878787 (hung)',0.00,'RETURNED',1836000.00,'2026-02-28 17:13:25.140272',9);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  UNIQUE KEY `UK_8vo36cen604as7etdfwmyjsxt` (`order_id`),
  CONSTRAINT `FK81gagumt0r8y3rmudcgpbk42l` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,728000.00,'2026-02-28 11:00:18.262211','2026-02-28 11:00:18.259704','COD','SUCCESS','COD1',NULL,1),(2,1378000.00,'2026-02-28 11:00:18.268525','2026-02-27 11:00:18.268526','VNPAY','SUCCESS','VNP17722512182672','00',2),(3,1078000.00,'2026-02-28 11:00:18.273503','2026-02-25 11:00:18.273503','VNPAY','SUCCESS','VNP17722512182734','00',4),(4,1038000.00,'2026-02-28 11:00:18.277785','2026-02-23 11:00:18.277786','VNPAY','SUCCESS','VNP17722512182776','00',6);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) NOT NULL,
  `is_primary` bit(1) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqnq71xsohugpqwf3c9gxmsuy` (`product_id`),
  CONSTRAINT `FKqnq71xsohugpqwf3c9gxmsuy` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251127/wearora/products/ua0ocobylpk195te0hfs.jpg',_binary '',0,1),(2,'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=800&h=1000&fit=crop',_binary '\0',1,1),(3,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251129/wearora/products/av0l8vcarhzbmq1pglii.jpg',_binary '',0,2),(4,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251130/wearora/products/ruia9tlmgpuumg6wt9kr.jpg',_binary '\0',1,2),(5,'https://images.unsplash.com/photo-1625910513413-5fc03823a43b?w=800&h=1000&fit=crop',_binary '',0,3),(6,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251133/wearora/products/uqqd3nulosncgiweqmvh.jpg',_binary '\0',1,3),(7,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251134/wearora/products/h0um4yqkvsvdjiv9n0sn.jpg',_binary '',0,4),(8,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251135/wearora/products/vtb2gtvftwdsfiqxibzp.jpg',_binary '\0',1,4),(9,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251136/wearora/products/hgxksevvj8y5vcz7kcq7.jpg',_binary '',0,5),(10,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251137/wearora/products/yuwwg2eulixncsgdxssq.jpg',_binary '\0',1,5),(11,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251139/wearora/products/zmnbfzultuzvtsqxdnah.jpg',_binary '',0,6),(12,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251140/wearora/products/qnorydrbd9nj3holivfu.jpg',_binary '\0',1,6),(13,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251142/wearora/products/e26fh8euzlmrocfj0eof.jpg',_binary '',0,7),(14,'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=800&h=1000&fit=crop',_binary '\0',1,7),(15,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251144/wearora/products/r1umvckgunqvrebdpofp.jpg',_binary '',0,8),(16,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251146/wearora/products/wv4krkxww6mbxqjsurs4.jpg',_binary '\0',1,8),(17,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251148/wearora/products/s3ertrkyptdzhguyhvl3.jpg',_binary '',0,9),(18,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251149/wearora/products/be1krzzghyopihrz3n4x.jpg',_binary '\0',1,9),(19,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251151/wearora/products/h0wzmtucjsgxfz4vft3k.jpg',_binary '',0,10),(20,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251152/wearora/products/gvczbl0pth6wdxlyh1dd.jpg',_binary '\0',1,10),(21,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251154/wearora/products/qjwxasjiaiujwwuzimiu.jpg',_binary '',0,11),(22,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251155/wearora/products/kokr51yz9j4s5t464ivp.jpg',_binary '\0',1,11),(23,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251156/wearora/products/glwzz0l5twebkbgvrjee.jpg',_binary '',0,12),(24,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251158/wearora/products/j3uc841tjesybjk2v4oh.jpg',_binary '\0',1,12),(25,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251159/wearora/products/safedgy7qot9s8mkwtfs.jpg',_binary '',0,13),(26,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251161/wearora/products/kddw1socokpva5e7anc8.jpg',_binary '\0',1,13),(27,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251162/wearora/products/uoxnuwqy6humguh9vhyk.jpg',_binary '',0,14),(28,'https://images.unsplash.com/photo-1523205771623-e0fafe7e8dc3?w=800&h=1000&fit=crop',_binary '\0',1,14),(29,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251165/wearora/products/secfljswecifhyrswtoh.jpg',_binary '',0,15),(30,'https://images.unsplash.com/photo-1544923246-77307dd270b5?w=800&h=1000&fit=crop',_binary '\0',1,15),(31,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251167/wearora/products/pqqdgvzgflycxffrbpqz.jpg',_binary '',0,16),(32,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251169/wearora/products/fnqjjnyz96cvwhvwgguo.jpg',_binary '\0',1,16),(33,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251170/wearora/products/ervmh37ljn0sirmmlnkg.jpg',_binary '',0,17),(34,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251173/wearora/products/o1oeiojgrxmxp6d8vk7j.jpg',_binary '\0',1,17),(35,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251174/wearora/products/budivx3mnfzmpzwjwg1n.jpg',_binary '',0,18),(36,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251175/wearora/products/ahodpnmhmncm1hh5ack1.jpg',_binary '\0',1,18),(37,'https://images.unsplash.com/photo-1555689502-c4b22d76e3d2?w=800&h=1000&fit=crop',_binary '',0,19),(38,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251178/wearora/products/fbfofzbsgvt4dav96nos.jpg',_binary '\0',1,19),(39,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251180/wearora/products/trojn4g2wnkvlz7z8v1s.jpg',_binary '',0,20),(40,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251181/wearora/products/tsxlzg4egpdnsc2zt7sr.jpg',_binary '\0',1,20),(41,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251182/wearora/products/nspjybom6m2w8eu5g51a.jpg',_binary '',0,21),(42,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251185/wearora/products/hccg5dxlu8ldfswukze5.jpg',_binary '\0',1,21),(43,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251188/wearora/products/vlv9sql1ciumip24z70p.jpg',_binary '',0,22),(44,'https://images.unsplash.com/photo-1593030103066-0093718e7d2c?w=800&h=1000&fit=crop',_binary '\0',1,22),(45,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251191/wearora/products/acbqtg0dfkbizjgxletj.jpg',_binary '',0,23),(46,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251193/wearora/products/hgnzihwnouptipltu1bz.jpg',_binary '\0',1,23),(47,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251194/wearora/products/kilfljwzukvqhxcnlbzm.jpg',_binary '',0,24),(48,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251195/wearora/products/ed8ksbqg0yurpikmwd7g.jpg',_binary '\0',1,24),(49,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251197/wearora/products/ot1adv2fos0lmmhy0mrt.jpg',_binary '',0,25),(50,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251199/wearora/products/brupolpdgknquxgjfial.jpg',_binary '\0',1,25),(51,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251200/wearora/products/ie8eqtmdfuskqqp2kehi.jpg',_binary '',0,26),(52,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251202/wearora/products/bqzfsle0xbmx8yn9ecvb.jpg',_binary '\0',1,26),(54,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251204/wearora/products/k0yguaytn2accntabb6s.jpg',_binary '\0',1,27),(55,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251206/wearora/products/wtmcwkff00s5egzhaspn.jpg',_binary '',0,28),(56,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251207/wearora/products/u936yba8cej0ru3orvcq.jpg',_binary '\0',1,28),(57,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251208/wearora/products/zpygd77wpnv1vg8inthk.jpg',_binary '',0,29),(58,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251209/wearora/products/kyzugypaopsdp6dkbc6i.jpg',_binary '\0',1,29),(61,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251211/wearora/products/oqggxdtc1cg5fnahtrlc.jpg',_binary '',0,30),(62,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772251213/wearora/products/hcw9kcaiusbjhymbue4f.jpg',_binary '\0',1,30),(64,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772256930/wearora/products/ncerenozl1ajanizlc4i.jpg',_binary '\0',1,27),(67,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772256920/wearora/products/itqixhgeqgfcw7zed9eg.jpg',_binary '',0,35),(68,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772257556/wearora/products/iut6oxuxwgigqdgdgdnp.jpg',_binary '\0',1,35);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` varchar(255) NOT NULL,
  `color_code` varchar(255) DEFAULT NULL,
  `size` varchar(255) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `stock_quantity` int NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_q935p2d1pbjm39n0063ghnfgn` (`sku`),
  KEY `FKosqitn4s405cynmhb87lkvuau` (`product_id`),
  CONSTRAINT `FKosqitn4s405cynmhb87lkvuau` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=301 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,'Đen','#1A1A1A','S','WR-1-S-DEN',43,1),(2,'Trắng','#FFFFFF','S','WR-1-S-TRANG',11,1),(3,'Xám','#808080','S','WR-1-S-XAM',34,1),(4,'Đen','#1A1A1A','M','WR-1-M-DEN',49,1),(5,'Trắng','#FFFFFF','M','WR-1-M-TRANG',18,1),(6,'Xám','#808080','M','WR-1-M-XAM',45,1),(7,'Đen','#1A1A1A','L','WR-1-L-DEN',16,1),(8,'Trắng','#FFFFFF','L','WR-1-L-TRANG',42,1),(9,'Xám','#808080','L','WR-1-L-XAM',18,1),(10,'Đen','#1A1A1A','XL','WR-1-XL-DEN',11,1),(11,'Trắng','#FFFFFF','XL','WR-1-XL-TRANG',14,1),(12,'Xám','#808080','XL','WR-1-XL-XAM',2,1),(13,'Đen','#1A1A1A','M','WR-2-M-DEN',26,2),(14,'Be','#D2B48C','M','WR-2-M-BE',35,2),(15,'Xanh rêu','#4A5D23','M','WR-2-M-XREU',50,2),(16,'Đen','#1A1A1A','L','WR-2-L-DEN',36,2),(17,'Be','#D2B48C','L','WR-2-L-BE',31,2),(18,'Xanh rêu','#4A5D23','L','WR-2-L-XREU',22,2),(19,'Đen','#1A1A1A','XL','WR-2-XL-DEN',11,2),(20,'Be','#D2B48C','XL','WR-2-XL-BE',48,2),(21,'Xanh rêu','#4A5D23','XL','WR-2-XL-XREU',13,2),(22,'Đen','#1A1A1A','XXL','WR-2-XXL-DEN',45,2),(23,'Be','#D2B48C','XXL','WR-2-XXL-BE',34,2),(24,'Xanh rêu','#4A5D23','XXL','WR-2-XXL-XREU',25,2),(25,'Xanh navy','#1F3B5C','S','WR-3-S-XNAVY',38,3),(26,'Trắng','#FFFFFF','S','WR-3-S-TRANG',29,3),(27,'Đen','#1A1A1A','S','WR-3-S-DEN',35,3),(28,'Xanh navy','#1F3B5C','M','WR-3-M-XNAVY',21,3),(29,'Trắng','#FFFFFF','M','WR-3-M-TRANG',45,3),(30,'Đen','#1A1A1A','M','WR-3-M-DEN',42,3),(31,'Xanh navy','#1F3B5C','L','WR-3-L-XNAVY',36,3),(32,'Trắng','#FFFFFF','L','WR-3-L-TRANG',20,3),(33,'Đen','#1A1A1A','L','WR-3-L-DEN',15,3),(34,'Xanh navy','#1F3B5C','XL','WR-3-XL-XNAVY',14,3),(35,'Trắng','#FFFFFF','XL','WR-3-XL-TRANG',31,3),(36,'Đen','#1A1A1A','XL','WR-3-XL-DEN',43,3),(37,'Trắng','#FFFFFF','S','WR-4-S-TRANG',43,4),(38,'Đen','#1A1A1A','S','WR-4-S-DEN',18,4),(39,'Đỏ đô','#8B0000','S','WR-4-S-DODO',48,4),(40,'Trắng','#FFFFFF','M','WR-4-M-TRANG',28,4),(41,'Đen','#1A1A1A','M','WR-4-M-DEN',36,4),(42,'Đỏ đô','#8B0000','M','WR-4-M-DODO',46,4),(43,'Trắng','#FFFFFF','L','WR-4-L-TRANG',16,4),(44,'Đen','#1A1A1A','L','WR-4-L-DEN',46,4),(45,'Đỏ đô','#8B0000','L','WR-4-L-DODO',29,4),(46,'Đen','#1A1A1A','S','WR-5-S-DEN',43,5),(47,'Xám','#808080','S','WR-5-S-XAM',34,5),(48,'Xanh navy','#1F3B5C','S','WR-5-S-XNAVY',35,5),(49,'Đen','#1A1A1A','M','WR-5-M-DEN',17,5),(50,'Xám','#808080','M','WR-5-M-XAM',38,5),(51,'Xanh navy','#1F3B5C','M','WR-5-M-XNAVY',28,5),(52,'Đen','#1A1A1A','L','WR-5-L-DEN',36,5),(53,'Xám','#808080','L','WR-5-L-XAM',20,5),(54,'Xanh navy','#1F3B5C','L','WR-5-L-XNAVY',23,5),(55,'Đen','#1A1A1A','XL','WR-5-XL-DEN',22,5),(56,'Xám','#808080','XL','WR-5-XL-XAM',35,5),(57,'Xanh navy','#1F3B5C','XL','WR-5-XL-XNAVY',43,5),(58,'Trắng','#FFFFFF','S','WR-6-S-TRANG',41,6),(59,'Đen','#1A1A1A','S','WR-6-S-DEN',45,6),(60,'Trắng','#FFFFFF','M','WR-6-M-TRANG',10,6),(61,'Đen','#1A1A1A','M','WR-6-M-DEN',39,6),(62,'Trắng','#FFFFFF','L','WR-6-L-TRANG',12,6),(63,'Đen','#1A1A1A','L','WR-6-L-DEN',10,6),(64,'Trắng','#FFFFFF','XL','WR-6-XL-TRANG',34,6),(65,'Đen','#1A1A1A','XL','WR-6-XL-DEN',24,6),(66,'Trắng','#FFFFFF','XXL','WR-6-XXL-TRANG',45,6),(67,'Đen','#1A1A1A','XXL','WR-6-XXL-DEN',50,6),(68,'Trắng','#FFFFFF','S','WR-7-S-TRANG',30,7),(69,'Xanh navy','#1F3B5C','S','WR-7-S-XNAVY',19,7),(70,'Trắng','#FFFFFF','M','WR-7-M-TRANG',30,7),(71,'Xanh navy','#1F3B5C','M','WR-7-M-XNAVY',28,7),(72,'Trắng','#FFFFFF','L','WR-7-L-TRANG',24,7),(73,'Xanh navy','#1F3B5C','L','WR-7-L-XNAVY',34,7),(74,'Trắng','#FFFFFF','XL','WR-7-XL-TRANG',18,7),(75,'Xanh navy','#1F3B5C','XL','WR-7-XL-XNAVY',24,7),(76,'Trắng','#FFFFFF','S','WR-8-S-TRANG',38,8),(77,'Be','#D2B48C','S','WR-8-S-BE',47,8),(78,'Xanh rêu','#4A5D23','S','WR-8-S-XREU',45,8),(79,'Trắng','#FFFFFF','M','WR-8-M-TRANG',21,8),(80,'Be','#D2B48C','M','WR-8-M-BE',17,8),(81,'Xanh rêu','#4A5D23','M','WR-8-M-XREU',29,8),(82,'Trắng','#FFFFFF','L','WR-8-L-TRANG',48,8),(83,'Be','#D2B48C','L','WR-8-L-BE',34,8),(84,'Xanh rêu','#4A5D23','L','WR-8-L-XREU',35,8),(85,'Xanh navy','#1F3B5C','S','WR-9-S-XNAVY',11,9),(86,'Đen','#1A1A1A','S','WR-9-S-DEN',50,9),(87,'Xanh navy','#1F3B5C','M','WR-9-M-XNAVY',35,9),(88,'Đen','#1A1A1A','M','WR-9-M-DEN',31,9),(89,'Xanh navy','#1F3B5C','L','WR-9-L-XNAVY',19,9),(90,'Đen','#1A1A1A','L','WR-9-L-DEN',25,9),(91,'Xanh navy','#1F3B5C','XL','WR-9-XL-XNAVY',27,9),(92,'Đen','#1A1A1A','XL','WR-9-XL-DEN',48,9),(93,'Trắng','#FFFFFF','S','WR-10-S-TRANG',42,10),(94,'Đen','#1A1A1A','S','WR-10-S-DEN',47,10),(95,'Nâu','#8B4513','S','WR-10-S-NAU',36,10),(96,'Trắng','#FFFFFF','M','WR-10-M-TRANG',27,10),(97,'Đen','#1A1A1A','M','WR-10-M-DEN',23,10),(98,'Nâu','#8B4513','M','WR-10-M-NAU',20,10),(99,'Trắng','#FFFFFF','L','WR-10-L-TRANG',27,10),(100,'Đen','#1A1A1A','L','WR-10-L-DEN',32,10),(101,'Nâu','#8B4513','L','WR-10-L-NAU',10,10),(102,'Trắng','#FFFFFF','XL','WR-10-XL-TRANG',28,10),(103,'Đen','#1A1A1A','XL','WR-10-XL-DEN',40,10),(104,'Nâu','#8B4513','XL','WR-10-XL-NAU',26,10),(105,'Trắng','#FFFFFF','S','WR-11-S-TRANG',29,11),(106,'Be','#D2B48C','S','WR-11-S-BE',34,11),(107,'Xanh navy','#1F3B5C','S','WR-11-S-XNAVY',42,11),(108,'Trắng','#FFFFFF','M','WR-11-M-TRANG',29,11),(109,'Be','#D2B48C','M','WR-11-M-BE',12,11),(110,'Xanh navy','#1F3B5C','M','WR-11-M-XNAVY',27,11),(111,'Trắng','#FFFFFF','L','WR-11-L-TRANG',11,11),(112,'Be','#D2B48C','L','WR-11-L-BE',21,11),(113,'Xanh navy','#1F3B5C','L','WR-11-L-XNAVY',39,11),(114,'Đen','#1A1A1A','M','WR-12-M-DEN',30,12),(115,'Xanh rêu','#4A5D23','M','WR-12-M-XREU',35,12),(116,'Nâu','#8B4513','M','WR-12-M-NAU',33,12),(117,'Đen','#1A1A1A','L','WR-12-L-DEN',12,12),(118,'Xanh rêu','#4A5D23','L','WR-12-L-XREU',22,12),(119,'Nâu','#8B4513','L','WR-12-L-NAU',35,12),(120,'Đen','#1A1A1A','XL','WR-12-XL-DEN',13,12),(121,'Xanh rêu','#4A5D23','XL','WR-12-XL-XREU',34,12),(122,'Nâu','#8B4513','XL','WR-12-XL-NAU',50,12),(123,'Đen','#1A1A1A','XXL','WR-12-XXL-DEN',50,12),(124,'Xanh rêu','#4A5D23','XXL','WR-12-XXL-XREU',28,12),(125,'Nâu','#8B4513','XXL','WR-12-XXL-NAU',22,12),(126,'Đen','#1A1A1A','S','WR-13-S-DEN',31,13),(127,'Be','#D2B48C','S','WR-13-S-BE',31,13),(128,'Đen','#1A1A1A','M','WR-13-M-DEN',18,13),(129,'Be','#D2B48C','M','WR-13-M-BE',11,13),(130,'Đen','#1A1A1A','L','WR-13-L-DEN',42,13),(131,'Be','#D2B48C','L','WR-13-L-BE',30,13),(132,'Xanh navy','#1F3B5C','S','WR-14-S-XNAVY',14,14),(133,'Đen','#1A1A1A','S','WR-14-S-DEN',16,14),(134,'Xanh navy','#1F3B5C','M','WR-14-M-XNAVY',35,14),(135,'Đen','#1A1A1A','M','WR-14-M-DEN',17,14),(136,'Xanh navy','#1F3B5C','L','WR-14-L-XNAVY',23,14),(137,'Đen','#1A1A1A','L','WR-14-L-DEN',14,14),(138,'Xanh navy','#1F3B5C','XL','WR-14-XL-XNAVY',47,14),(139,'Đen','#1A1A1A','XL','WR-14-XL-DEN',33,14),(140,'Đen','#1A1A1A','S','WR-15-S-DEN',38,15),(141,'Xám','#808080','S','WR-15-S-XAM',42,15),(142,'Xanh rêu','#4A5D23','S','WR-15-S-XREU',43,15),(143,'Đen','#1A1A1A','M','WR-15-M-DEN',43,15),(144,'Xám','#808080','M','WR-15-M-XAM',16,15),(145,'Xanh rêu','#4A5D23','M','WR-15-M-XREU',39,15),(146,'Đen','#1A1A1A','L','WR-15-L-DEN',15,15),(147,'Xám','#808080','L','WR-15-L-XAM',13,15),(148,'Xanh rêu','#4A5D23','L','WR-15-L-XREU',40,15),(149,'Đen','#1A1A1A','XL','WR-15-XL-DEN',22,15),(150,'Xám','#808080','XL','WR-15-XL-XAM',19,15),(151,'Xanh rêu','#4A5D23','XL','WR-15-XL-XREU',37,15),(152,'Đen','#1A1A1A','XXL','WR-15-XXL-DEN',22,15),(153,'Xám','#808080','XXL','WR-15-XXL-XAM',19,15),(154,'Xanh rêu','#4A5D23','XXL','WR-15-XXL-XREU',18,15),(155,'Xanh navy','#1F3B5C','29','WR-16-29-XNAVY',12,16),(156,'Đen','#1A1A1A','29','WR-16-29-DEN',40,16),(157,'Xanh navy','#1F3B5C','30','WR-16-30-XNAVY',36,16),(158,'Đen','#1A1A1A','30','WR-16-30-DEN',23,16),(159,'Xanh navy','#1F3B5C','31','WR-16-31-XNAVY',32,16),(160,'Đen','#1A1A1A','31','WR-16-31-DEN',13,16),(161,'Xanh navy','#1F3B5C','32','WR-16-32-XNAVY',33,16),(162,'Đen','#1A1A1A','32','WR-16-32-DEN',14,16),(163,'Xanh navy','#1F3B5C','34','WR-16-34-XNAVY',49,16),(164,'Đen','#1A1A1A','34','WR-16-34-DEN',30,16),(165,'Xanh navy','#1F3B5C','26','WR-17-26-XNAVY',37,17),(166,'Đen','#1A1A1A','26','WR-17-26-DEN',17,17),(167,'Xám','#808080','26','WR-17-26-XAM',39,17),(168,'Xanh navy','#1F3B5C','27','WR-17-27-XNAVY',29,17),(169,'Đen','#1A1A1A','27','WR-17-27-DEN',10,17),(170,'Xám','#808080','27','WR-17-27-XAM',27,17),(171,'Xanh navy','#1F3B5C','28','WR-17-28-XNAVY',12,17),(172,'Đen','#1A1A1A','28','WR-17-28-DEN',40,17),(173,'Xám','#808080','28','WR-17-28-XAM',32,17),(174,'Xanh navy','#1F3B5C','29','WR-17-29-XNAVY',21,17),(175,'Đen','#1A1A1A','29','WR-17-29-DEN',48,17),(176,'Xám','#808080','29','WR-17-29-XAM',21,17),(177,'Xanh navy','#1F3B5C','30','WR-17-30-XNAVY',31,17),(178,'Đen','#1A1A1A','30','WR-17-30-DEN',29,17),(179,'Xám','#808080','30','WR-17-30-XAM',38,17),(180,'Xanh navy','#1F3B5C','28','WR-18-28-XNAVY',26,18),(181,'Xám','#808080','28','WR-18-28-XAM',50,18),(182,'Xanh navy','#1F3B5C','29','WR-18-29-XNAVY',34,18),(183,'Xám','#808080','29','WR-18-29-XAM',22,18),(184,'Xanh navy','#1F3B5C','30','WR-18-30-XNAVY',45,18),(185,'Xám','#808080','30','WR-18-30-XAM',30,18),(186,'Xanh navy','#1F3B5C','31','WR-18-31-XNAVY',11,18),(187,'Xám','#808080','31','WR-18-31-XAM',22,18),(188,'Xanh navy','#1F3B5C','32','WR-18-32-XNAVY',49,18),(189,'Xám','#808080','32','WR-18-32-XAM',45,18),(190,'Đen','#1A1A1A','28','WR-19-28-DEN',39,19),(191,'Xanh navy','#1F3B5C','28','WR-19-28-XNAVY',31,19),(192,'Đen','#1A1A1A','29','WR-19-29-DEN',41,19),(193,'Xanh navy','#1F3B5C','29','WR-19-29-XNAVY',21,19),(194,'Đen','#1A1A1A','30','WR-19-30-DEN',24,19),(195,'Xanh navy','#1F3B5C','30','WR-19-30-XNAVY',41,19),(196,'Đen','#1A1A1A','31','WR-19-31-DEN',25,19),(197,'Xanh navy','#1F3B5C','31','WR-19-31-XNAVY',40,19),(198,'Đen','#1A1A1A','32','WR-19-32-DEN',24,19),(199,'Xanh navy','#1F3B5C','32','WR-19-32-XNAVY',27,19),(200,'Đen','#1A1A1A','34','WR-19-34-DEN',30,19),(201,'Xanh navy','#1F3B5C','34','WR-19-34-XNAVY',18,19),(202,'Đen','#1A1A1A','29','WR-20-29-DEN',37,20),(203,'Xám','#808080','29','WR-20-29-XAM',25,20),(204,'Xanh navy','#1F3B5C','29','WR-20-29-XNAVY',49,20),(205,'Đen','#1A1A1A','30','WR-20-30-DEN',33,20),(206,'Xám','#808080','30','WR-20-30-XAM',23,20),(207,'Xanh navy','#1F3B5C','30','WR-20-30-XNAVY',44,20),(208,'Đen','#1A1A1A','31','WR-20-31-DEN',48,20),(209,'Xám','#808080','31','WR-20-31-XAM',36,20),(210,'Xanh navy','#1F3B5C','31','WR-20-31-XNAVY',48,20),(211,'Đen','#1A1A1A','32','WR-20-32-DEN',14,20),(212,'Xám','#808080','32','WR-20-32-XAM',30,20),(213,'Xanh navy','#1F3B5C','32','WR-20-32-XNAVY',35,20),(214,'Đen','#1A1A1A','34','WR-20-34-DEN',40,20),(215,'Xám','#808080','34','WR-20-34-XAM',44,20),(216,'Xanh navy','#1F3B5C','34','WR-20-34-XNAVY',18,20),(217,'Đen','#1A1A1A','26','WR-21-26-DEN',40,21),(218,'Be','#D2B48C','26','WR-21-26-BE',42,21),(219,'Đen','#1A1A1A','27','WR-21-27-DEN',26,21),(220,'Be','#D2B48C','27','WR-21-27-BE',29,21),(221,'Đen','#1A1A1A','28','WR-21-28-DEN',41,21),(222,'Be','#D2B48C','28','WR-21-28-BE',11,21),(223,'Đen','#1A1A1A','29','WR-21-29-DEN',10,21),(224,'Be','#D2B48C','29','WR-21-29-BE',30,21),(225,'Đen','#1A1A1A','30','WR-21-30-DEN',41,21),(226,'Be','#D2B48C','30','WR-21-30-BE',45,21),(227,'Đen','#1A1A1A','29','WR-22-29-DEN',13,22),(228,'Xanh navy','#1F3B5C','29','WR-22-29-XNAVY',36,22),(229,'Xám','#808080','29','WR-22-29-XAM',43,22),(230,'Đen','#1A1A1A','30','WR-22-30-DEN',43,22),(231,'Xanh navy','#1F3B5C','30','WR-22-30-XNAVY',41,22),(232,'Xám','#808080','30','WR-22-30-XAM',17,22),(233,'Đen','#1A1A1A','31','WR-22-31-DEN',37,22),(234,'Xanh navy','#1F3B5C','31','WR-22-31-XNAVY',30,22),(235,'Xám','#808080','31','WR-22-31-XAM',31,22),(236,'Đen','#1A1A1A','32','WR-22-32-DEN',16,22),(237,'Xanh navy','#1F3B5C','32','WR-22-32-XNAVY',43,22),(238,'Xám','#808080','32','WR-22-32-XAM',19,22),(239,'Đen','#1A1A1A','S','WR-23-S-DEN',38,23),(240,'Be','#D2B48C','S','WR-23-S-BE',20,23),(241,'Đỏ đô','#8B0000','S','WR-23-S-DODO',47,23),(242,'Đen','#1A1A1A','M','WR-23-M-DEN',41,23),(243,'Be','#D2B48C','M','WR-23-M-BE',45,23),(244,'Đỏ đô','#8B0000','M','WR-23-M-DODO',24,23),(245,'Đen','#1A1A1A','L','WR-23-L-DEN',35,23),(246,'Be','#D2B48C','L','WR-23-L-BE',14,23),(247,'Đỏ đô','#8B0000','L','WR-23-L-DODO',26,23),(248,'Đen','#1A1A1A','S','WR-24-S-DEN',28,24),(249,'Đỏ đô','#8B0000','S','WR-24-S-DODO',46,24),(250,'Be','#D2B48C','S','WR-24-S-BE',10,24),(251,'Đen','#1A1A1A','M','WR-24-M-DEN',14,24),(252,'Đỏ đô','#8B0000','M','WR-24-M-DODO',50,24),(253,'Be','#D2B48C','M','WR-24-M-BE',29,24),(254,'Đen','#1A1A1A','L','WR-24-L-DEN',22,24),(255,'Đỏ đô','#8B0000','L','WR-24-L-DODO',43,24),(256,'Be','#D2B48C','L','WR-24-L-BE',37,24),(257,'Trắng','#FFFFFF','S','WR-25-S-TRANG',16,25),(258,'Đen','#1A1A1A','S','WR-25-S-DEN',32,25),(259,'Xanh navy','#1F3B5C','S','WR-25-S-XNAVY',31,25),(260,'Trắng','#FFFFFF','M','WR-25-M-TRANG',22,25),(261,'Đen','#1A1A1A','M','WR-25-M-DEN',31,25),(262,'Xanh navy','#1F3B5C','M','WR-25-M-XNAVY',33,25),(263,'Trắng','#FFFFFF','L','WR-25-L-TRANG',36,25),(264,'Đen','#1A1A1A','L','WR-25-L-DEN',44,25),(265,'Xanh navy','#1F3B5C','L','WR-25-L-XNAVY',21,25),(266,'Be','#D2B48C','S','WR-26-S-BE',50,26),(267,'Đỏ đô','#8B0000','S','WR-26-S-DODO',36,26),(268,'Be','#D2B48C','M','WR-26-M-BE',27,26),(269,'Đỏ đô','#8B0000','M','WR-26-M-DODO',10,26),(270,'Be','#D2B48C','L','WR-26-L-BE',31,26),(271,'Đỏ đô','#8B0000','L','WR-26-L-DODO',18,26),(272,'Đen','#1A1A1A','S','WR-27-S-DEN',20,27),(273,'Xám','#808080','S','WR-27-S-XAM',18,27),(274,'Đỏ đô','#8B0000','S','WR-27-S-DODO',11,27),(275,'Đen','#1A1A1A','M','WR-27-M-DEN',27,27),(276,'Xám','#808080','M','WR-27-M-XAM',47,27),(277,'Đỏ đô','#8B0000','M','WR-27-M-DODO',21,27),(278,'Đen','#1A1A1A','L','WR-27-L-DEN',42,27),(279,'Xám','#808080','L','WR-27-L-XAM',44,27),(280,'Đỏ đô','#8B0000','L','WR-27-L-DODO',17,27),(281,'Be','#D2B48C','F','WR-28-F-BE',38,28),(282,'Đen','#1A1A1A','F','WR-28-F-DEN',25,28),(283,'Xanh rêu','#4A5D23','F','WR-28-F-XREU',44,28),(284,'Đen','#1A1A1A','F','WR-29-F-DEN',16,29),(285,'Nâu','#8B4513','F','WR-29-F-NAU',19,29),(292,'Đỏ đô','#8B0000','F','WR-30-F-DODO',17,30),(293,'Be','#D2B48C','F','WR-30-F-BE',34,30),(294,'Đen','#1A1A1A','F','WR-30-F-DEN',37,30),(299,'Đen','#000000','M','SKU-002',2,35),(300,'Trắng','#000000','L','SKU-003',10,35);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `featured` bit(1) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','UNISEX') NOT NULL,
  `name` varchar(255) NOT NULL,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `category_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ostq1ec3toafnjok09y9l7dox` (`slug`),
  KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`),
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,_binary '',299000.00,'WEARORA','2026-02-28 10:58:45.781161','Áo thun cổ tròn chất liệu cotton 100% mềm mại, thoáng mát. Thiết kế basic dễ phối đồ, phù hợp mọi hoạt động hằng ngày.',_binary '\0','UNISEX','Áo thun cổ tròn Classic',NULL,'ao-thun-co-tron-classic','2026-02-28 10:58:45.781161',1),(2,_binary '',349000.00,'WEARORA','2026-02-28 10:58:48.544141','Áo thun oversize form rộng thoải mái. Chất vải dày dặn, không nhăn sau nhiều lần giặt. Xu hướng thời trang đường phố.',_binary '\0','UNISEX','Áo thun Oversize Premium',NULL,'ao-thun-oversize-premium','2026-02-28 10:58:48.544141',1),(3,_binary '',399000.00,'WEARORA','2026-02-28 10:58:50.810936','Áo thun polo chất liệu cotton pha spandex co giãn tốt. Cổ bẻ dứng form, phù hợp mặc đi làm hoặc dạo phố.',_binary '\0','MALE','Áo thun polo nam thanh lịch',NULL,'ao-thun-polo-nam','2026-02-28 10:58:50.810936',1),(4,_binary '',279000.00,'WEARORA','2026-02-28 10:58:53.242485','Áo thun crop top nữ trẻ trung, năng động. Chất cotton mềm mại, form Ỵm đẹp. Phối cùng quần cạp cao rất hợp thời trang.',_binary '\0','FEMALE','Áo thun crop top nữ',NULL,'ao-thun-crop-top-nu','2026-02-28 10:58:53.242485',1),(5,_binary '',329000.00,'WEARORA','2026-02-28 10:58:55.501900','Áo thun tay dài basic thiết kế tối giản. Chất vải cotton thoáng mát, giữ ấm nhẹ khi trời se lạnh.',_binary '\0','UNISEX','Áo thun tay dài basic',NULL,'ao-thun-tay-dai-basic','2026-02-28 10:58:55.501900',1),(6,_binary '',359000.00,'WEARORA','2026-02-28 10:58:57.981805','Áo thun in họa tiết độc quyền của WEARORA. Thiết kế phong cách đường phố, in nhiệt bền màu, không bị bạc sau giặt.',_binary '','UNISEX','Áo thun in họa tiết',289000.00,'ao-thun-in-hoa-tiet','2026-02-28 10:58:57.981805',1),(7,_binary '',549000.00,'WEARORA','2026-02-28 10:59:00.876194','Áo sơ mi trắng chất liệu vải Oxford cao cấp, form slim fit lịch lãm. Phù hợp mặc công sở, dự tiệc.',_binary '\0','MALE','Áo sơ mi trắng Oxford',NULL,'ao-so-mi-trang-oxford','2026-02-28 10:59:00.876194',2),(8,_binary '',499000.00,'WEARORA','2026-02-28 10:59:03.269229','Áo sơ mi chất linen tự nhiên, thoáng mát mùa hè. Kiểu dáng rộng rãi, nữ tính mà vẫn hiện đại.',_binary '\0','FEMALE','Áo sơ mi linen nữ',NULL,'ao-so-mi-linen-nu','2026-02-28 10:59:03.269229',2),(9,_binary '',479000.00,'WEARORA','2026-02-28 10:59:06.548800','Áo sơ mi kẻ sọc dọc thanh lịch. Vải cotton mềm mại, không nhăn. Phù hợp đi làm và dạo phố.',_binary '','MALE','Áo sơ mi kẻ sọc',NULL,'ao-so-mi-ke-soc','2026-02-28 10:59:06.548800',2),(10,_binary '',529000.00,'WEARORA','2026-02-28 10:59:09.171316','Áo sơ mi cổ tàu phong cách Đông Á hiện đại. Chất vải mới mịn, thiết kế tinh tế, độc đáo.',_binary '\0','MALE','Áo sơ mi cổ Mandarin',NULL,'ao-so-mi-co-mandarin','2026-02-28 10:59:09.171316',2),(11,_binary '',459000.00,'WEARORA','2026-02-28 10:59:12.822908','Áo sơ mi oversize nữ phong cách Hàn Quốc. Form rộng thoải mái, có thể mặc đơn hoặc layer ngoài áo thun.',_binary '\0','FEMALE','Áo sơ mi oversize nữ',NULL,'ao-so-mi-oversize-nu','2026-02-28 10:59:12.822908',2),(12,_binary '',799000.00,'WEARORA','2026-02-28 10:59:15.480742','Áo khoác bomber phong cách đường phố. Vải dù chống gió nhẹ, lót cotton giữ ấm. Dây kéo chất lượng, bền đẹp.',_binary '','UNISEX','Áo khoác bomber unisex',NULL,'ao-khoac-bomber-unisex','2026-02-28 10:59:15.480742',3),(13,_binary '',899000.00,'WEARORA','2026-02-28 10:59:18.707806','Áo khoác blazer nữ form chuẩn, dáng thẳng đứng. Chất vải dày dặn, giữ form tốt. Làm tăng đẳng cấp khi mặc.',_binary '\0','FEMALE','Áo khoác blazer nữ',749000.00,'ao-khoac-blazer-nu','2026-02-28 10:59:18.707806',3),(14,_binary '',749000.00,'WEARORA','2026-02-28 10:59:21.081258','Áo khoác denim cổ điển, chất jean dày dặn. Form chuẩn, dễ phối với nhiều phong cách khác nhau.',_binary '\0','UNISEX','Áo khoác denim',NULL,'ao-khoac-denim','2026-02-28 10:59:21.081258',3),(15,_binary '',599000.00,'WEARORA','2026-02-28 10:59:23.902283','Áo khoác gió siêu nhẹ, gấp gọn dễ mang theo. Chất vải chống nước nhẹ, phù hợp đi du lịch và hoạt động ngoài trời.',_binary '\0','UNISEX','Áo khoác gió nhẹ',NULL,'ao-khoac-gio-nhe','2026-02-28 10:59:23.902283',3),(16,_binary '',599000.00,'WEARORA','2026-02-28 10:59:26.525269','Quần jean slim fit form đẹp, tôn dáng. Vải denim co giãn cao cấp, mặc thoải mái cả ngày dài.',_binary '\0','MALE','Quần jean slim fit',NULL,'quan-jean-slim-fit','2026-02-28 10:59:26.525269',4),(17,_binary '',549000.00,'WEARORA','2026-02-28 10:59:29.378729','Quần jean baggy nữ form rộng, cá tính. Cạp cao tôn dáng, chất jean mềm không bí.',_binary '','FEMALE','Quần jean baggy nữ',NULL,'quan-jean-baggy-nu','2026-02-28 10:59:29.378729',4),(18,_binary '',579000.00,'WEARORA','2026-02-28 10:59:33.289908','Quần jean ống rộng phong cách retro. Chất denim dày dặn, ống suông từ gối xuống tạo cảm giác thanh thoát.',_binary '\0','UNISEX','Quần jean ống rộng',NULL,'quan-jean-ong-rong','2026-02-28 10:59:33.289908',4),(19,_binary '',529000.00,'WEARORA','2026-02-28 10:59:36.033615','Quần jean skinny ôm sát, tôn dáng. Vải co giãn 4 chiều, không gò bó khi di chuyển.',_binary '\0','UNISEX','Quần jean skinny',449000.00,'quan-jean-skinny','2026-02-28 10:59:36.033615',4),(20,_binary '',649000.00,'WEARORA','2026-02-28 10:59:38.967198','Quần tây công sở nam form đứng chuẩn. Vải cao cấp không nhăn, giữ nếp ly sắc nét suốt cả ngày.',_binary '\0','MALE','Quần tây công sở nam',NULL,'quan-tay-cong-so-nam','2026-02-28 10:59:38.967198',5),(21,_binary '',599000.00,'WEARORA','2026-02-28 10:59:41.424830','Quần tây nữ ống đứng lịch sự. Cạp cao, form suông tôn dáng. Phù hợp mặc đi làm, dự sự kiện.',_binary '\0','FEMALE','Quần tây nữ ống đứng',NULL,'quan-tay-nu-ong-dung','2026-02-28 10:59:41.424830',5),(22,_binary '',679000.00,'WEARORA','2026-02-28 10:59:45.289815','Quần tây slim fit hiện đại, trẻ trung. Phải sống sắc nét, vải co giãn nhẹ thoải mái vận động.',_binary '','MALE','Quần tây slim fit',NULL,'quan-tay-slim-fit','2026-02-28 10:59:45.289815',5),(23,_binary '',549000.00,'WEARORA','2026-02-28 10:59:50.056457','Quần culottes nữ ống rộng thanh lịch. Chất vải mềm rũ, form bay bổng nữ tính. Dễ phối nhiều kiểu áo.',_binary '\0','FEMALE','Quần culottes nữ',NULL,'quan-culottes-nu','2026-02-28 10:59:50.056457',5),(24,_binary '',699000.00,'WEARORA','2026-02-28 10:59:52.976754','Đầm midi dáng chữ A thanh lịch, quý phái. Vải cao cấp, không nhăn. Phù hợp dự tiệc, đi làm.',_binary '','FEMALE','Đầm midi thanh lịch',NULL,'dam-midi-thanh-lich','2026-02-28 10:59:52.976754',6),(25,_binary '',449000.00,'WEARORA','2026-02-28 10:59:55.919527','Váy tennis xòe năng động, trẻ trung. Có quần lót trong, thoải mái vận động. Phù hợp thể thao và đi chơi.',_binary '\0','FEMALE','Váy tennis xòe',NULL,'vay-tennis-xoe','2026-02-28 10:59:55.919527',6),(26,_binary '',799000.00,'WEARORA','2026-02-28 10:59:59.266132','Đầm maxi phong cách boho tự do, lãng mạn. Vải voan nhẹ bay bổng, họa tiết hoa nhỏ tinh tế.',_binary '\0','FEMALE','Đầm maxi boho',649000.00,'dam-maxi-boho','2026-02-28 10:59:59.266132',6),(27,_binary '',499000.00,'WEARORA','2026-02-28 11:00:02.148416','Chân váy bút chì ôm form, tôn đường cong. Vải co giãn tốt, xẻ sau vừa phải, dễ di chuyển.',_binary '\0','FEMALE','Chân váy bút chì',NULL,'chan-vay-but-chi','2026-02-28 11:00:02.148416',6),(28,_binary '',349000.00,'WEARORA','2026-02-28 11:00:04.847182','Túi tote canvas chất liệu bền, sức chứa lớn. Thiết kế đơn giản, phù hợp đi học, đi làm, dạo phố.',_binary '\0','UNISEX','Túi tote canvas',NULL,'tui-tote-canvas','2026-02-28 11:00:04.847182',7),(29,_binary '',449000.00,'WEARORA','2026-02-28 11:00:07.601244','Thắt lưng da bò thật 100%. Khóa kim loại chắc chắn, thiết kế sang trọng, bền đẹp theo thời gian.',_binary '','MALE','Thắt lưng da thật',NULL,'that-lung-da-that','2026-02-28 11:00:07.601244',7),(30,_binary '',299000.00,'WEARORA','2026-02-28 11:00:09.958029','Khăn quàng lụa mềm mịn, bóng mượt. Nhiều cách quàng đa dạng. Tăng thêm nét nữ tính, thanh lịch.',_binary '\0','FEMALE','Khăn quàng lụa 1',NULL,'khn-qung-la-1','2026-02-28 12:31:43.014998',7),(35,_binary '',12000.00,'wearora','2026-02-28 12:35:18.895726','',_binary '\0','MALE','test',10000.00,'test','2026-02-28 12:35:18.895726',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returns`
--

DROP TABLE IF EXISTS `returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  KEY `FKtge2tys80xohjn8v3wtiy21yi` (`order_id`),
  KEY `FKof2cd2g96d3xgt0lnqbrydgvx` (`user_id`),
  CONSTRAINT `FKof2cd2g96d3xgt0lnqbrydgvx` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKtge2tys80xohjn8v3wtiy21yi` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returns`
--

LOCK TABLES `returns` WRITE;
/*!40000 ALTER TABLE `returns` DISABLE KEYS */;
INSERT INTO `returns` VALUES (1,'2026-02-28 15:15:37.961201','2026-02-28 17:13:25.098108','Sản phẩm bị lỗi/hỏng',0.00,'APPROVED',7,9);
/*!40000 ALTER TABLE `returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` text,
  `created_at` datetime(6) DEFAULT NULL,
  `rating` int NOT NULL,
  `visible` bit(1) DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqwgq1lxgahsxdspnwqfac6sv6` (`order_id`),
  KEY `FKpl51cejpw4gy5swfar8br9ngi` (`product_id`),
  KEY `FKcgy7qjc1r99dp117y9en6lxye` (`user_id`),
  CONSTRAINT `FKcgy7qjc1r99dp117y9en6lxye` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKqwgq1lxgahsxdspnwqfac6sv6` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'Chất vải rất đẹp, mặc thoáng mát. Sẽ mua thêm.','2026-02-28 11:00:18.307406',5,_binary '',1,1,4),(2,'Đúng size, giao hàng nhanh. Hài lòng!','2026-02-28 11:00:18.308407',5,_binary '',1,3,4),(3,'Màu sắc đẹp như hình, chất lượng tốt.','2026-02-28 11:00:18.312481',4,_binary '',2,7,5),(4,'Sản phẩm tốt, giá hợp lý. Rất đáng mua.','2026-02-28 11:00:18.312481',4,_binary '',2,12,5),(5,'Form áo đẹp, mặc lên rất tôn dáng. 5 sao!','2026-02-28 11:00:18.315482',5,_binary '',6,13,4),(6,'Chất liệu thực tế hơi khác so với hình nhưng vẫn đẹp.','2026-02-28 11:00:18.315482',3,_binary '',6,6,4);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shippings`
--

DROP TABLE IF EXISTS `shippings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  UNIQUE KEY `UK_tu4d98vdobypyhhq3d7am3qo` (`order_id`),
  CONSTRAINT `FK8bxet17ivvhhma7tid6k0gr8o` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shippings`
--

LOCK TABLES `shippings` WRITE;
/*!40000 ALTER TABLE `shippings` DISABLE KEYS */;
INSERT INTO `shippings` VALUES (1,'Giao Hàng Nhanh','2026-02-26 11:00:18.264212','2026-02-27 11:00:18.264212',NULL,'2026-02-23 11:00:18.263212','DELIVERED','GHN00000001',1),(2,'Giao Hàng Nhanh','2026-02-26 11:00:18.269040','2026-02-27 11:00:18.269040',NULL,'2026-02-23 11:00:18.269040','DELIVERED','GHN00000002',2),(3,'Giao Hàng Nhanh',NULL,'2026-03-02 11:00:18.271294',NULL,'2026-02-27 11:00:18.271294','IN_TRANSIT','GHN00000003',3),(4,'Giao Hàng Nhanh',NULL,'2026-03-04 11:00:18.274034',NULL,NULL,'PENDING','GHN00000004',4),(5,'Giao Hàng Nhanh',NULL,'2026-03-05 11:00:18.276189',NULL,NULL,'PENDING','GHN00000005',5),(6,'Giao Hàng Nhanh','2026-02-26 11:00:18.278790','2026-02-27 11:00:18.278790',NULL,'2026-02-23 11:00:18.278790','DELIVERED','GHN00000006',6);
/*!40000 ALTER TABLE `shippings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'2026-02-28 10:58:36.225386','admin@wearora.com',_binary '','Nguyễn Văn Admin','$2a$10$WTFj2P1SpeufrmKSXfC2m.Uaz74aTShW8vhT4XTGHK5mQxvXCvJoK','0901000001','ADMIN','2026-02-28 10:58:36.225386'),(2,NULL,'2026-02-28 10:58:36.235896','staff@wearora.com',_binary '','Trần Thị Staff','$2a$10$WTFj2P1SpeufrmKSXfC2m.Uaz74aTShW8vhT4XTGHK5mQxvXCvJoK','0901000002','STAFF','2026-02-28 10:58:36.235896'),(3,NULL,'2026-02-28 10:58:36.237897','staff2@wearora.com',_binary '','Lê Văn Nhân','$2a$10$WTFj2P1SpeufrmKSXfC2m.Uaz74aTShW8vhT4XTGHK5mQxvXCvJoK','0901000003','STAFF','2026-02-28 10:58:36.237897'),(4,NULL,'2026-02-28 10:58:36.238897','mai@gmail.com',_binary '','Phạm Thị Mai','$2a$10$WTFj2P1SpeufrmKSXfC2m.Uaz74aTShW8vhT4XTGHK5mQxvXCvJoK','0912345678','CUSTOMER','2026-02-28 10:58:36.238897'),(5,NULL,'2026-02-28 10:58:36.239897','duc@gmail.com',_binary '','Hoàng Văn Đức','$2a$10$WTFj2P1SpeufrmKSXfC2m.Uaz74aTShW8vhT4XTGHK5mQxvXCvJoK','0923456789','CUSTOMER','2026-02-28 10:58:36.239897'),(6,NULL,'2026-02-28 10:58:36.241402','lan@gmail.com',_binary '','Nguyễn Thị Lan','$2a$10$WTFj2P1SpeufrmKSXfC2m.Uaz74aTShW8vhT4XTGHK5mQxvXCvJoK','0934567890','CUSTOMER','2026-02-28 10:58:36.241402'),(7,NULL,'2026-02-28 10:58:36.242403','tuan@gmail.com',_binary '','Vũ Minh Tuấn','$2a$10$WTFj2P1SpeufrmKSXfC2m.Uaz74aTShW8vhT4XTGHK5mQxvXCvJoK','0945678901','CUSTOMER','2026-02-28 10:58:36.242403'),(8,NULL,'2026-02-28 10:58:36.243403','linh@gmail.com',_binary '\0','Đặng Thùy Linh','$2a$10$WTFj2P1SpeufrmKSXfC2m.Uaz74aTShW8vhT4XTGHK5mQxvXCvJoK','0956789012','CUSTOMER','2026-02-28 12:17:29.230857'),(9,NULL,'2026-02-28 12:49:26.670055','hung@gmail.com',_binary '','hung1','$2a$10$QcCM.fLEk8Fe5dyfRL/X/.NujeKz7yFViUhWafr.hv5e3NLDlA5di','0987878787','CUSTOMER','2026-02-28 14:22:51.063499');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKht6e6158srxsvjciahp1kjywf` (`user_id`,`product_id`),
  KEY `FKl7ao98u2bm8nijc1rv4jobcrx` (`product_id`),
  CONSTRAINT `FK330pyw2el06fn5g28ypyljt16` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKl7ao98u2bm8nijc1rv4jobcrx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (1,'2026-02-28 11:00:18.324299',4,4),(2,'2026-02-28 11:00:18.325299',19,4),(3,'2026-02-28 11:00:18.325299',15,4),(4,'2026-02-28 11:00:18.326299',26,5),(5,'2026-02-28 11:00:18.326299',6,5),(6,'2026-02-28 11:00:18.326299',20,6),(7,'2026-02-28 11:00:18.327299',24,6),(8,'2026-02-28 11:00:18.327299',3,6),(9,'2026-02-28 11:00:18.327299',7,7),(10,'2026-02-28 11:00:18.328300',13,7),(11,'2026-02-28 11:00:18.328300',3,8),(12,'2026-02-28 11:00:18.328300',7,8),(15,'2026-02-28 15:12:58.438943',30,9);
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-28 20:05:49
