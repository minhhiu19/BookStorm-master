package com.bookstorm.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyRevenueResponse {

    private int year;
    private int month;
    private BigDecimal totalRevenue;
    private long totalOrders;
}
