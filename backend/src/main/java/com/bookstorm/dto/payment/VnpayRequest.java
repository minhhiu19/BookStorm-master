package com.bookstorm.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VnpayRequest {

    @NotBlank(message = "Order code is required")
    private String orderCode;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String bankCode;

    private String returnUrl;
}
