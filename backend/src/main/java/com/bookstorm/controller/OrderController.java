package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.order.CreateOrderRequest;
import com.bookstorm.dto.order.OrderResponse;
import com.bookstorm.model.Order;
import com.bookstorm.model.User;
import com.bookstorm.service.AddressService;
import com.bookstorm.dto.shipping.ShippingResponse;
import com.bookstorm.service.OrderService;
import com.bookstorm.service.ShippingService;
import com.bookstorm.service.UserService;
import com.bookstorm.model.Address;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final AddressService addressService;
    private final ShippingService shippingService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        Long userId = getCurrentUserId();
        Order.PaymentMethod paymentMethod = Order.PaymentMethod.valueOf(request.getPaymentMethod());
        Order order = orderService.createOrder(userId, buildShippingAddress(request.getAddressId()),
                paymentMethod, request.getCouponCode(), request.getNote());
        OrderResponse response = orderService.getOrderResponseByCode(order.getOrderCode());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderResponse> orderPage = orderService.getOrderResponsesByUserId(userId, pageable);
        PageResponse<OrderResponse> pageResponse = PageResponse.<OrderResponse>builder()
                .content(orderPage.getContent())
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByCode(
            @PathVariable String orderCode) {
        OrderResponse response = orderService.getOrderResponseByCode(orderCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{orderCode}/shipping")
    public ResponseEntity<ApiResponse<ShippingResponse>> getOrderShipping(
            @PathVariable String orderCode) {
        try {
            ShippingResponse response = shippingService.getShippingByOrder(orderCode);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (com.bookstorm.exception.ResourceNotFoundException e) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
    }

    @PutMapping("/{orderCode}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable String orderCode) {
        Order order = orderService.getOrderByCode(orderCode);
        orderService.cancelOrder(order.getId());
        OrderResponse response = orderService.getOrderResponseByCode(orderCode);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userService.getUserByEmail(userDetails.getUsername());
        return user.getId();
    }

    private String buildShippingAddress(Long addressId) {
        Address address = addressService.getAddressesByUserId(getCurrentUserId()).stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new com.bookstorm.exception.ResourceNotFoundException("Address", "id", addressId));
        return String.format("%s, %s, %s, %s, %s - %s (%s)",
                address.getAddressDetail(), address.getWard(), address.getDistrict(),
                address.getProvince(), address.getFullName(), address.getPhone(),
                address.getFullName());
    }
}
