package com.bookstorm.repository;

import com.bookstorm.model.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShippingRepository extends JpaRepository<Shipping, Long> {

    Optional<Shipping> findByOrderId(Long orderId);

    Optional<Shipping> findByTrackingCode(String trackingCode);
}
