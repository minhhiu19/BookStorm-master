package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.dashboard.BestSellerResponse;
import com.bookstorm.dto.dashboard.DashboardStatsResponse;
import com.bookstorm.dto.dashboard.MonthlyRevenueResponse;
import com.bookstorm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse response = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<ApiResponse<List<BestSellerResponse>>> getBestSellingProducts() {
        List<BestSellerResponse> response = dashboardService.getBestSellingProducts();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/best-sellers/detailed")
    public ResponseEntity<ApiResponse<List<BestSellerResponse>>> getBestSellingProductsDetailed(
            @RequestParam(defaultValue = "20") int limit) {
        List<BestSellerResponse> response = dashboardService.getBestSellingProductsDetailed(limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/monthly-revenue")
    public ResponseEntity<ApiResponse<MonthlyRevenueResponse>> getMonthlyRevenue(
            @RequestParam int year,
            @RequestParam int month) {
        MonthlyRevenueResponse response = dashboardService.getMonthlyRevenue(year, month);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
