package com.bookstorm.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    public enum DiscountType {
        PERCENTAGE, FIXED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    private Integer usageLimit;

    @Builder.Default
    private Integer usedCount = 0;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Builder.Default
    private Boolean active = true;
}
