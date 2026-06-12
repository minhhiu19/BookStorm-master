package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.order.OrderResponse;
import com.bookstorm.dto.order.UpdateOrderStatusRequest;
import com.bookstorm.model.Order;
import com.bookstorm.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderResponse> orderPage = orderService.getAllOrderResponses(pageable, status);
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
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(
            @PathVariable String orderCode) {
        OrderResponse response = orderService.getOrderResponseByCode(orderCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{orderCode}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderCode,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order order = orderService.getOrderByCode(orderCode);
        Order.Status newStatus = Order.Status.valueOf(request.getStatus().toUpperCase());
        orderService.updateOrderStatus(order.getId(), newStatus);
        OrderResponse response = orderService.getOrderResponseByCode(orderCode);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }
}
