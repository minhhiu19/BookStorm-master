package com.bookstorm.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private String orderCode;
    private String shippingAddress;
    private BigDecimal totalAmount;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private String note;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> orderItems;
}
