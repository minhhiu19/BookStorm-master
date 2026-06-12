package com.bookstorm.service;

import com.bookstorm.dto.order.OrderItemResponse;
import com.bookstorm.dto.order.OrderResponse;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.*;
import com.bookstorm.repository.BookRepository;
import com.bookstorm.repository.CartRepository;
import com.bookstorm.repository.OrderItemRepository;
import com.bookstorm.repository.OrderRepository;
import com.bookstorm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final CartService cartService;
    private final CouponService couponService;
    private final ShippingConfigService shippingConfigService;
    private final ShippingService shippingService;

    @Transactional
    public Order createOrder(Long userId, String shippingAddress, Order.PaymentMethod paymentMethod,
                             String couponCode, String note) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Calculate total from cart items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getCartItems()) {
            Book book = cartItem.getBook();

            // Verify stock
            if (book.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for book: " + book.getName());
            }

            BigDecimal price = book.getSalePrice() != null ? book.getSalePrice() : book.getBasePrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            // Get primary image URL
            String imageUrl = book.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .map(BookImage::getImageUrl)
                    .orElse(book.getImages().isEmpty() ? null : book.getImages().get(0).getImageUrl());

            OrderItem orderItem = OrderItem.builder()
                    .book(book)
                    .productName(book.getName())
                    .productImage(imageUrl)
                    .price(price)
                    .quantity(cartItem.getQuantity())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);

            // Decrease stock
            book.setStockQuantity(book.getStockQuantity() - cartItem.getQuantity());
            bookRepository.save(book);
        }

        // Apply coupon if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (couponCode != null && !couponCode.isEmpty()) {
            discountAmount = couponService.applyCoupon(couponCode, totalAmount);
            couponService.incrementUsage(couponCode);
        }

        BigDecimal shippingFee = shippingConfigService.calculateShippingFee(totalAmount);
        BigDecimal finalAmount = totalAmount.add(shippingFee).subtract(discountAmount);

        // Generate order code
        String orderCode = "BS" + System.currentTimeMillis();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .shippingAddress(shippingAddress)
                .totalAmount(totalAmount)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .paymentMethod(paymentMethod)
                .note(note)
                .status(Order.Status.PENDING)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Save order items
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }

        // Clear cart
        cartService.clearCart(userId);

        return savedOrder;
    }

    public Order getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderCode", orderCode));
    }

    public Page<Order> getOrdersByUserId(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.Status status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setStatus(status);

        // Auto-create shipping record when order moves to SHIPPING
        if (status == Order.Status.SHIPPING) {
            shippingService.ensureShippingExists(order);
        }

        // If delivered and payment method is COD, mark as paid
        if (status == Order.Status.DELIVERED && order.getPaymentMethod() == Order.PaymentMethod.COD) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != Order.Status.PENDING) {
            throw new BadRequestException("Only pending orders can be cancelled");
        }

        order.setStatus(Order.Status.CANCELLED);

        // Restore stock
        for (OrderItem item : order.getOrderItems()) {
            if (item.getBook() != null) {
                Book book = item.getBook();
                book.setStockQuantity(book.getStockQuantity() + item.getQuantity());
                bookRepository.save(book);
            }
        }

        return orderRepository.save(order);
    }

    public Page<Order> getAllOrders(Pageable pageable, String status) {
        if (status != null && !status.isEmpty()) {
            return orderRepository.findByStatus(Order.Status.valueOf(status.toUpperCase()), pageable);
        }
        return orderRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrderResponses(Pageable pageable, String status) {
        Page<Order> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByStatus(Order.Status.valueOf(status.toUpperCase()), pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }
        return orders.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderResponseByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderCode", orderCode));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrderResponsesByUserId(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems() != null
                ? order.getOrderItems().stream().map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .bookId(item.getBook() != null ? item.getBook().getId() : null)
                        .bookName(item.getProductName())
                        .bookImage(item.getProductImage())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                    .collect(Collectors.toList())
                : Collections.emptyList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .shippingAddress(order.getShippingAddress())
                .totalAmount(order.getTotalAmount())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)
                .note(order.getNote())
                .customerId(order.getUser() != null ? order.getUser().getId() : null)
                .customerName(order.getUser() != null ? order.getUser().getFullName() : null)
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .createdAt(order.getCreatedAt())
                .orderItems(itemResponses)
                .build();
    }
}
