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
public class DashboardStatsResponse {

    private long totalOrders;
    private BigDecimal totalRevenue;
    private long totalCustomers;
    private long totalProducts;
    private long pendingOrders;
    private long todayOrders;
    private BigDecimal todayRevenue;
    private List<MonthlyRevenueResponse> monthlyRevenue;
}
