package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.coupon.CouponRequest;
import com.bookstorm.dto.coupon.CouponResponse;
import com.bookstorm.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CouponResponse>>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"));
        PageResponse<CouponResponse> response = couponService.getAllCoupons(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(@PathVariable Long id) {
        CouponResponse response = couponService.getCouponResponseById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @Valid @RequestBody CouponRequest request) {
        CouponResponse response = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {
        CouponResponse response = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully"));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<CouponResponse>> toggleCouponActive(@PathVariable Long id) {
        CouponResponse response = couponService.toggleCouponActive(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon status toggled", response));
    }
}
