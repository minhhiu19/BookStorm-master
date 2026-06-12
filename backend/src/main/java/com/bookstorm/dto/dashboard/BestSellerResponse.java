package com.bookstorm.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BestSellerResponse {

    private Long bookId;
    private String bookName;
    private String thumbnail;
    private BigDecimal basePrice;
    private Long totalSold;
    private BigDecimal totalRevenue;
}
