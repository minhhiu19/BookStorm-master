package com.bookstorm.repository;

import com.bookstorm.model.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    Page<Coupon> findByActiveTrue(Pageable pageable);

    boolean existsByCode(String code);
}
