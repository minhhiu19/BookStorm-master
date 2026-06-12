package com.bookstorm.dto.shipping;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingRequest {

    private String trackingCode;
    private String carrier;
    private String status;
    private String note;
}
