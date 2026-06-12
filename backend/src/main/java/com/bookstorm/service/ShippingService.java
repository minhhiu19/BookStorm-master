package com.bookstorm.service;

import com.bookstorm.dto.shipping.ShippingRequest;
import com.bookstorm.dto.shipping.ShippingResponse;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Notification;
import com.bookstorm.model.Order;
import com.bookstorm.model.Shipping;
import com.bookstorm.repository.OrderRepository;
import com.bookstorm.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShippingRepository shippingRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    private String generateTrackingCode() {
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(5);
        String uuid = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "WR" + timestamp + uuid;
    }

    @Transactional
    public Shipping createShipping(Long orderId, String trackingCode, String carrier,
                                    LocalDateTime estimatedDelivery) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        String finalTrackingCode = (trackingCode != null && !trackingCode.isBlank())
                ? trackingCode : generateTrackingCode();

        Shipping shipping = Shipping.builder()
                .order(order)
                .trackingCode(finalTrackingCode)
                .carrier(carrier)
                .estimatedDelivery(estimatedDelivery)
                .status(Shipping.Status.PENDING)
                .build();

        return shippingRepository.save(shipping);
    }

    @Transactional
    public ShippingResponse createShipping(String orderCode, ShippingRequest request) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderCode", orderCode));

        String trackingCode = (request.getTrackingCode() != null && !request.getTrackingCode().isBlank())
                ? request.getTrackingCode() : generateTrackingCode();

        Shipping shipping = Shipping.builder()
                .order(order)
                .trackingCode(trackingCode)
                .carrier(request.getCarrier())
                .status(Shipping.Status.PENDING)
                .note(request.getNote())
                .build();

        return toResponse(shippingRepository.save(shipping));
    }

    @Transactional
    public Shipping updateShippingStatus(Long shippingId, Shipping.Status status) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping", "id", shippingId));

        shipping.setStatus(status);

        if (status == Shipping.Status.PICKED_UP || status == Shipping.Status.IN_TRANSIT) {
            if (shipping.getShippedAt() == null) {
                shipping.setShippedAt(LocalDateTime.now());
            }
        }

        if (status == Shipping.Status.DELIVERED) {
            shipping.setDeliveredAt(LocalDateTime.now());
            // Auto-update order status to DELIVERED
            Order order = shipping.getOrder();
            order.setStatus(Order.Status.DELIVERED);
            if (order.getPaymentMethod() == Order.PaymentMethod.COD) {
                order.setPaymentStatus(Order.PaymentStatus.PAID);
            }
            orderRepository.save(order);
        }

        if (status == Shipping.Status.FAILED) {
            handleFailedDelivery(shipping, shipping.getNote());
        }

        return shippingRepository.save(shipping);
    }

    @Transactional
    public ShippingResponse updateShippingStatus(Long id, ShippingRequest request) {
        Shipping shipping = shippingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping", "id", id));

        if (request.getStatus() != null) {
            Shipping.Status status = Shipping.Status.valueOf(request.getStatus());
            shipping.setStatus(status);

            if (status == Shipping.Status.PICKED_UP || status == Shipping.Status.IN_TRANSIT) {
                if (shipping.getShippedAt() == null) {
                    shipping.setShippedAt(LocalDateTime.now());
                }
            }

            if (status == Shipping.Status.DELIVERED) {
                shipping.setDeliveredAt(LocalDateTime.now());
                // Auto-update order status to DELIVERED
                Order order = shipping.getOrder();
                order.setStatus(Order.Status.DELIVERED);
                if (order.getPaymentMethod() == Order.PaymentMethod.COD) {
                    order.setPaymentStatus(Order.PaymentStatus.PAID);
                }
                orderRepository.save(order);
            }

            if (status == Shipping.Status.FAILED) {
                handleFailedDelivery(shipping, request.getNote());
            }
        }

        if (request.getTrackingCode() != null) {
            shipping.setTrackingCode(request.getTrackingCode());
        }

        if (request.getCarrier() != null) {
            shipping.setCarrier(request.getCarrier());
        }

        if (request.getNote() != null) {
            shipping.setNote(request.getNote());
        }

        return toResponse(shippingRepository.save(shipping));
    }

    private void handleFailedDelivery(Shipping shipping, String reason) {
        Order order = shipping.getOrder();
        Long userId = order.getUser().getId();
        String orderCode = order.getOrderCode();
        String noteText = (reason != null && !reason.isBlank()) ? reason : "Không xác định";

        notificationService.createNotification(
                userId,
                "Giao hàng thất bại - Đơn #" + orderCode,
                "Đơn hàng #" + orderCode + " giao hàng thất bại. Lý do: " + noteText
                        + ". Vui lòng liên hệ hỗ trợ để được giúp đỡ.",
                Notification.Type.ORDER
        );
    }

    @Transactional
    public Shipping ensureShippingExists(Order order) {
        return shippingRepository.findByOrderId(order.getId())
                .orElseGet(() -> {
                    Shipping shipping = Shipping.builder()
                            .order(order)
                            .trackingCode(generateTrackingCode())
                            .carrier("GHN")
                            .status(Shipping.Status.PENDING)
                            .build();
                    return shippingRepository.save(shipping);
                });
    }

    public Shipping getShippingByOrderId(Long orderId) {
        return shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping", "orderId", orderId));
    }

    public ShippingResponse getShippingByOrder(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderCode", orderCode));

        Shipping shipping = shippingRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipping", "orderCode", orderCode));

        return toResponse(shipping);
    }

    public Shipping getShippingByTrackingCode(String trackingCode) {
        return shippingRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping", "trackingCode", trackingCode));
    }

    private ShippingResponse toResponse(Shipping shipping) {
        return ShippingResponse.builder()
                .id(shipping.getId())
                .orderId(shipping.getOrder().getId())
                .orderCode(shipping.getOrder().getOrderCode())
                .trackingCode(shipping.getTrackingCode())
                .carrier(shipping.getCarrier())
                .status(shipping.getStatus().name())
                .estimatedDelivery(shipping.getEstimatedDelivery())
                .shippedAt(shipping.getShippedAt())
                .deliveredAt(shipping.getDeliveredAt())
                .note(shipping.getNote())
                .build();
    }
}
