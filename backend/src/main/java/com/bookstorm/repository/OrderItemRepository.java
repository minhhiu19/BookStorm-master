package com.bookstorm.repository;

import com.bookstorm.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.book.id, oi.productName, SUM(oi.quantity) as totalSold FROM OrderItem oi GROUP BY oi.book.id, oi.productName ORDER BY totalSold DESC")
    List<Object[]> findBestSellers();

    @Query("SELECT oi.book.id, oi.productName, SUM(oi.quantity) as totalSold, SUM(oi.quantity * oi.price) as totalRevenue FROM OrderItem oi WHERE oi.order.status = 'DELIVERED' GROUP BY oi.book.id, oi.productName ORDER BY totalSold DESC")
    List<Object[]> findBestSellersDetailed();
}
