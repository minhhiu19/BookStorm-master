package com.bookstorm.dto.coupon;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    private String description;

    @NotBlank(message = "Discount type is required")
    private String discountType;

    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;

    private BigDecimal maxDiscount;

    private Integer usageLimit;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private boolean active;
}
