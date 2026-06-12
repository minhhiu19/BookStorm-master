package com.bookstorm.dto.coupon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyCouponResponse {

    private String code;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
}
