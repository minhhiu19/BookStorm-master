package com.bookstorm.repository;

import com.bookstorm.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Optional<Order> findByOrderCode(String orderCode);

    Page<Order> findByStatus(Order.Status status, Pageable pageable);

    List<Order> findByUserIdAndStatus(Long userId, Order.Status status);

    long countByStatusAndCreatedAtBetween(Order.Status status, LocalDateTime start, LocalDateTime end);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatus(Order.Status status);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.paymentStatus = 'PAID' AND o.createdAt BETWEEN :start AND :end")
    BigDecimal getRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT DATE(o.createdAt) as date, SUM(o.finalAmount) as total FROM Order o WHERE o.paymentStatus = 'PAID' AND o.createdAt BETWEEN :start AND :end GROUP BY DATE(o.createdAt)")
    List<Object[]> getDailyRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
