package com.bookstorm.dto.coupon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponResponse {

    private Long id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscount;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;
    private BigDecimal discountAmount;
}
