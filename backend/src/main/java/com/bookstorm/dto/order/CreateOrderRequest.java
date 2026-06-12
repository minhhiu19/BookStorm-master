package com.bookstorm.dto.order;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @NotNull(message = "Address ID is required")
    private Long addressId;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    private String couponCode;

    private String note;
}
