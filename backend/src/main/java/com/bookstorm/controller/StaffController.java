package com.bookstorm.controller;

import com.bookstorm.dto.book.BookResponse;
import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.order.OrderResponse;
import com.bookstorm.dto.order.UpdateOrderStatusRequest;
import com.bookstorm.model.Order;
import com.bookstorm.service.BookService;
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
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final OrderService orderService;
    private final BookService bookService;
    private final com.bookstorm.service.ReturnRequestService returnRequestService;

    // ==================== Dashboard ====================

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getStaffDashboard() {
        java.util.Map<String, Object> stats = new java.util.LinkedHashMap<>();

        Pageable onePage = PageRequest.of(0, 1);
        Page<OrderResponse> pendingOrders = orderService.getAllOrderResponses(onePage, "PENDING");
        Page<OrderResponse> confirmedOrders = orderService.getAllOrderResponses(onePage, "CONFIRMED");
        Page<OrderResponse> shippingOrders = orderService.getAllOrderResponses(onePage, "SHIPPING");

        stats.put("pendingOrders", pendingOrders.getTotalElements());
        stats.put("confirmedOrders", confirmedOrders.getTotalElements());
        stats.put("shippingOrders", shippingOrders.getTotalElements());
        stats.put("totalActiveOrders", pendingOrders.getTotalElements() + confirmedOrders.getTotalElements() + shippingOrders.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ==================== Orders ====================

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderResponse> orderPage = orderService.getAllOrderResponses(pageable, status);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(orderPage)));
    }

    @GetMapping("/orders/{orderCode}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(
            @PathVariable String orderCode) {
        OrderResponse response = orderService.getOrderResponseByCode(orderCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/orders/{orderCode}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderCode,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order order = orderService.getOrderByCode(orderCode);
        Order.Status newStatus = Order.Status.valueOf(request.getStatus().toUpperCase());
        orderService.updateOrderStatus(order.getId(), newStatus);
        OrderResponse response = orderService.getOrderResponseByCode(orderCode);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }

    // ==================== Books (Inventory) ====================

    @GetMapping("/books")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<BookResponse> bookPage = bookService.getAllBooks(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(bookPage)));
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<ApiResponse<BookResponse>> getBookDetail(@PathVariable Long id) {
        BookResponse response = bookService.getBookById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/books/{id}/stock")
    public ResponseEntity<ApiResponse<BookResponse>> updateBookStock(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> data) {
        if (data.containsKey("stockQuantity") && data.get("stockQuantity") != null) {
            Integer stock = ((Number) data.get("stockQuantity")).intValue();
            bookService.updateStock(id, stock);
        }
        BookResponse response = bookService.getBookById(id);
        return ResponseEntity.ok(ApiResponse.success("Book stock updated successfully", response));
    }

    // ==================== Returns ====================

    @GetMapping("/returns")
    public ResponseEntity<ApiResponse<PageResponse<com.bookstorm.dto.returnrequest.ReturnRequestResponse>>> getReturns(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<com.bookstorm.dto.returnrequest.ReturnRequestResponse> pageResponse = returnRequestService.getAllReturns(pageable, status);
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @PutMapping("/returns/{id}/process")
    public ResponseEntity<ApiResponse<com.bookstorm.dto.returnrequest.ReturnRequestResponse>> processReturn(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> data) {
        boolean approved = Boolean.TRUE.equals(data.get("approved"));
        java.math.BigDecimal refundAmount = data.get("refundAmount") != null
                ? new java.math.BigDecimal(data.get("refundAmount").toString())
                : java.math.BigDecimal.ZERO;
        com.bookstorm.dto.returnrequest.ReturnRequestResponse response = returnRequestService.processReturn(id, approved, refundAmount);
        return ResponseEntity.ok(ApiResponse.success(approved ? "Return approved" : "Return rejected", response));
    }

    // ==================== Support ====================

    @GetMapping("/support/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getSupportOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderResponse> orderPage = orderService.getAllOrderResponses(pageable, null);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(orderPage)));
    }
}
