package com.bookstorm.service;

import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.coupon.ApplyCouponRequest;
import com.bookstorm.dto.coupon.CouponRequest;
import com.bookstorm.dto.coupon.CouponResponse;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Coupon;
import com.bookstorm.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new BadRequestException("Coupon code already exists: " + coupon.getCode());
        }

        if (coupon.getStartDate().isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Start date must be before end date");
        }

        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, Coupon updatedData) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        if (updatedData.getCode() != null) {
            couponRepository.findByCode(updatedData.getCode()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new BadRequestException("Coupon code already exists: " + updatedData.getCode());
                }
            });
            coupon.setCode(updatedData.getCode());
        }
        if (updatedData.getDescription() != null) {
            coupon.setDescription(updatedData.getDescription());
        }
        if (updatedData.getDiscountType() != null) {
            coupon.setDiscountType(updatedData.getDiscountType());
        }
        if (updatedData.getDiscountValue() != null) {
            coupon.setDiscountValue(updatedData.getDiscountValue());
        }
        if (updatedData.getMinOrderAmount() != null) {
            coupon.setMinOrderAmount(updatedData.getMinOrderAmount());
        }
        if (updatedData.getMaxDiscount() != null) {
            coupon.setMaxDiscount(updatedData.getMaxDiscount());
        }
        if (updatedData.getUsageLimit() != null) {
            coupon.setUsageLimit(updatedData.getUsageLimit());
        }
        if (updatedData.getStartDate() != null) {
            coupon.setStartDate(updatedData.getStartDate());
        }
        if (updatedData.getEndDate() != null) {
            coupon.setEndDate(updatedData.getEndDate());
        }
        if (updatedData.getActive() != null) {
            coupon.setActive(updatedData.getActive());
        }

        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        couponRepository.delete(coupon);
    }

    public Page<Coupon> getAllCouponsPage(Pageable pageable) {
        return couponRepository.findAll(pageable);
    }

    public PageResponse<CouponResponse> getAllCoupons(Pageable pageable) {
        Page<Coupon> page = couponRepository.findAll(pageable);
        List<CouponResponse> items = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PageResponse.<CouponResponse>builder()
                .content(items)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .discountType(Coupon.DiscountType.valueOf(request.getDiscountType()))
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscount(request.getMaxDiscount())
                .usageLimit(request.getUsageLimit())
                .startDate(request.getStartDate() != null ? request.getStartDate().atStartOfDay() : null)
                .endDate(request.getEndDate() != null ? request.getEndDate().atTime(23, 59, 59) : null)
                .active(request.isActive())
                .build();
        return toResponse(createCoupon(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon data = Coupon.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .discountType(Coupon.DiscountType.valueOf(request.getDiscountType()))
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscount(request.getMaxDiscount())
                .usageLimit(request.getUsageLimit())
                .startDate(request.getStartDate() != null ? request.getStartDate().atStartOfDay() : null)
                .endDate(request.getEndDate() != null ? request.getEndDate().atTime(23, 59, 59) : null)
                .active(request.isActive())
                .build();
        return toResponse(updateCoupon(id, data));
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponResponseById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        return toResponse(coupon);
    }

    @Transactional
    public CouponResponse toggleCouponActive(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        coupon.setActive(!Boolean.TRUE.equals(coupon.getActive()));
        return toResponse(couponRepository.save(coupon));
    }

    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));
    }

    public BigDecimal applyCoupon(String couponCode, BigDecimal orderTotal) {
        Coupon coupon = getCouponByCode(couponCode);

        // Validate active
        if (!coupon.getActive()) {
            throw new BadRequestException("Coupon is not active");
        }

        // Validate date range
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Coupon is not valid at this time");
        }

        // Validate min order amount
        if (orderTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Order total must be at least " + coupon.getMinOrderAmount() + " to use this coupon");
        }

        // Validate usage limit
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit has been reached");
        }

        // Calculate discount
        BigDecimal discount;
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discount = orderTotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            // Apply max discount cap if set
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        } else {
            // FIXED discount
            discount = coupon.getDiscountValue();
        }

        // Discount should not exceed order total
        if (discount.compareTo(orderTotal) > 0) {
            discount = orderTotal;
        }

        return discount;
    }

    public CouponResponse applyCoupon(ApplyCouponRequest request) {
        BigDecimal discountAmount = applyCoupon(request.getCode(), request.getOrderAmount());
        Coupon coupon = getCouponByCode(request.getCode());

        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscount(coupon.getMaxDiscount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .active(coupon.getActive() != null && coupon.getActive())
                .discountAmount(discountAmount)
                .build();
    }

    @Transactional
    public void incrementUsage(String couponCode) {
        Coupon coupon = getCouponByCode(couponCode);
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscount(coupon.getMaxDiscount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .active(coupon.getActive() != null && coupon.getActive())
                .build();
    }
}
