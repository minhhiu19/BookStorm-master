package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.coupon.ApplyCouponRequest;
import com.bookstorm.dto.coupon.CouponResponse;
import com.bookstorm.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<CouponResponse>> applyCoupon(
            @Valid @RequestBody ApplyCouponRequest request) {
        CouponResponse response = couponService.applyCoupon(request);
        return ResponseEntity.ok(ApiResponse.success("Coupon applied successfully", response));
    }
}
