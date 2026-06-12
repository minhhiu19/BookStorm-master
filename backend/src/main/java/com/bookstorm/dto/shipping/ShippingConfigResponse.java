package com.bookstorm.dto.shipping;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingConfigResponse {
    private BigDecimal defaultFee;
    private BigDecimal freeThreshold;
    private List<String> carriers;
}
