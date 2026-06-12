package com.bookstorm.dto.shipping;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingResponse {

    private Long id;
    private Long orderId;
    private String orderCode;
    private String trackingCode;
    private String carrier;
    private String status;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private String note;
}
