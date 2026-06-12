package com.bookstorm.dto.returnrequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestResponse {

    private Long id;
    private Long orderId;
    private String orderCode;
    private String userName;
    private String reason;
    private String status;
    private BigDecimal refundAmount;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
