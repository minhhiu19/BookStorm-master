package com.bookstorm.service;

import com.bookstorm.dto.dashboard.BestSellerResponse;
import com.bookstorm.dto.dashboard.DashboardStatsResponse;
import com.bookstorm.dto.dashboard.MonthlyRevenueResponse;
import com.bookstorm.model.Book;
import com.bookstorm.model.Order;
import com.bookstorm.model.Role;
import com.bookstorm.repository.BookRepository;
import com.bookstorm.repository.OrderItemRepository;
import com.bookstorm.repository.OrderRepository;
import com.bookstorm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final OrderItemRepository orderItemRepository;

    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime startOfTime = LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime now = LocalDateTime.now();

        BigDecimal totalRevenue = orderRepository.getRevenueBetween(startOfTime, now);

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        long todayOrders = orderRepository.countByCreatedAtBetween(startOfToday, endOfToday);

        BigDecimal todayRevenue = orderRepository.getRevenueBetween(startOfToday, endOfToday);

        // Build monthly revenue for current year
        int currentYear = LocalDate.now().getYear();
        List<MonthlyRevenueResponse> monthlyRevenue = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            monthlyRevenue.add(getMonthlyRevenue(currentYear, month));
        }

        return DashboardStatsResponse.builder()
                .totalOrders(orderRepository.count())
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalCustomers(userRepository.countByRole(Role.CUSTOMER))
                .totalProducts(bookRepository.countByActiveTrue())
                .pendingOrders(orderRepository.countByStatus(Order.Status.PENDING))
                .todayOrders(todayOrders)
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .monthlyRevenue(monthlyRevenue)
                .build();
    }

    public MonthlyRevenueResponse getMonthlyRevenue(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end;
        if (month == 12) {
            end = LocalDateTime.of(year + 1, 1, 1, 0, 0).minusSeconds(1);
        } else {
            end = LocalDateTime.of(year, month + 1, 1, 0, 0).minusSeconds(1);
        }

        BigDecimal revenue = orderRepository.getRevenueBetween(start, end);
        long totalOrders = orderRepository.countByCreatedAtBetween(start, end);

        return MonthlyRevenueResponse.builder()
                .year(year)
                .month(month)
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .build();
    }

    public List<BestSellerResponse> getBestSellingProducts() {
        List<Object[]> bestSellers = orderItemRepository.findBestSellers();
        List<BestSellerResponse> result = new ArrayList<>();

        int limit = Math.min(bestSellers.size(), 10);
        for (int i = 0; i < limit; i++) {
            Object[] row = bestSellers.get(i);
            result.add(BestSellerResponse.builder()
                    .bookId((Long) row[0])
                    .bookName((String) row[1])
                    .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<BestSellerResponse> getBestSellingProductsDetailed(int limit) {
        List<Object[]> bestSellers = orderItemRepository.findBestSellersDetailed();
        List<BestSellerResponse> result = new ArrayList<>();

        int count = Math.min(bestSellers.size(), limit);
        for (int i = 0; i < count; i++) {
            Object[] row = bestSellers.get(i);
            Long bookId = (Long) row[0];
            String bookName = (String) row[1];
            Long totalSold = (Long) row[2];
            BigDecimal totalRevenue = (BigDecimal) row[3];

            // Get book details for thumbnail and price
            String thumbnail = null;
            BigDecimal basePrice = BigDecimal.ZERO;
            Book book = bookRepository.findById(bookId).orElse(null);
            if (book != null) {
                basePrice = book.getBasePrice();
                if (book.getImages() != null && !book.getImages().isEmpty()) {
                    thumbnail = book.getImages().get(0).getImageUrl();
                }
            }

            result.add(BestSellerResponse.builder()
                    .bookId(bookId)
                    .bookName(bookName)
                    .thumbnail(thumbnail)
                    .basePrice(basePrice)
                    .totalSold(totalSold)
                    .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                    .build());
        }

        return result;
    }
}
