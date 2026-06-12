package com.bookstorm.service;

import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.returnrequest.ReturnRequestDTO;
import com.bookstorm.dto.returnrequest.ReturnRequestResponse;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Order;
import com.bookstorm.model.ReturnRequest;
import com.bookstorm.model.User;
import com.bookstorm.repository.OrderRepository;
import com.bookstorm.repository.ReturnRequestRepository;
import com.bookstorm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReturnRequest createReturnRequest(Long userId, Long orderId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to this user");
        }

        if (order.getStatus() != Order.Status.DELIVERED) {
            throw new BadRequestException("Return requests can only be created for delivered orders");
        }

        ReturnRequest returnRequest = ReturnRequest.builder()
                .order(order)
                .user(user)
                .reason(reason)
                .refundAmount(order.getFinalAmount())
                .status(ReturnRequest.Status.PENDING)
                .build();

        return returnRequestRepository.save(returnRequest);
    }

    @Transactional
    public ReturnRequestResponse createReturnRequest(Long userId, String orderCode, ReturnRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderCode", orderCode));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to this user");
        }

        if (order.getStatus() != Order.Status.DELIVERED) {
            throw new BadRequestException("Return requests can only be created for delivered orders");
        }

        ReturnRequest returnRequest = ReturnRequest.builder()
                .order(order)
                .user(user)
                .reason(request.getReason())
                .refundAmount(order.getFinalAmount())
                .status(ReturnRequest.Status.PENDING)
                .build();

        return toResponse(returnRequestRepository.save(returnRequest));
    }

    public Page<ReturnRequest> getReturnsByUserId(Long userId, Pageable pageable) {
        return returnRequestRepository.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReturnRequestResponse> getMyReturns(Long userId, Pageable pageable) {
        Page<ReturnRequest> page = returnRequestRepository.findByUserId(userId, pageable);
        return toPageResponse(page);
    }

    @Transactional
    public ReturnRequest processReturn(Long returnId, boolean approved) {
        ReturnRequest returnRequest = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", returnId));

        if (returnRequest.getStatus() != ReturnRequest.Status.PENDING) {
            throw new BadRequestException("Return request has already been processed");
        }

        if (approved) {
            returnRequest.setStatus(ReturnRequest.Status.APPROVED);

            // Update order status
            Order order = returnRequest.getOrder();
            order.setStatus(Order.Status.RETURNED);
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
            orderRepository.save(order);
        } else {
            returnRequest.setStatus(ReturnRequest.Status.REJECTED);
        }

        returnRequest.setProcessedAt(LocalDateTime.now());
        return returnRequestRepository.save(returnRequest);
    }

    @Transactional
    public ReturnRequestResponse processReturn(Long id, boolean approved, BigDecimal refundAmount) {
        ReturnRequest returnRequest = returnRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", id));

        if (returnRequest.getStatus() != ReturnRequest.Status.PENDING) {
            throw new BadRequestException("Return request has already been processed");
        }

        if (approved) {
            returnRequest.setStatus(ReturnRequest.Status.APPROVED);
            returnRequest.setRefundAmount(refundAmount);

            // Update order status
            Order order = returnRequest.getOrder();
            order.setStatus(Order.Status.RETURNED);
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
            orderRepository.save(order);
        } else {
            returnRequest.setStatus(ReturnRequest.Status.REJECTED);
        }

        returnRequest.setProcessedAt(LocalDateTime.now());
        return toResponse(returnRequestRepository.save(returnRequest));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReturnRequestResponse> getAllReturns(Pageable pageable) {
        Page<ReturnRequest> page = returnRequestRepository.findAll(pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReturnRequestResponse> getAllReturns(Pageable pageable, String status) {
        Page<ReturnRequest> page;
        if (status != null && !status.isBlank()) {
            ReturnRequest.Status statusEnum = ReturnRequest.Status.valueOf(status.toUpperCase());
            page = returnRequestRepository.findByStatus(statusEnum, pageable);
        } else {
            page = returnRequestRepository.findAll(pageable);
        }
        return toPageResponse(page);
    }

    private ReturnRequestResponse toResponse(ReturnRequest returnRequest) {
        return ReturnRequestResponse.builder()
                .id(returnRequest.getId())
                .orderId(returnRequest.getOrder().getId())
                .orderCode(returnRequest.getOrder().getOrderCode())
                .userName(returnRequest.getUser().getFullName())
                .reason(returnRequest.getReason())
                .status(returnRequest.getStatus().name())
                .refundAmount(returnRequest.getRefundAmount())
                .createdAt(returnRequest.getCreatedAt())
                .processedAt(returnRequest.getProcessedAt())
                .build();
    }

    private PageResponse<ReturnRequestResponse> toPageResponse(Page<ReturnRequest> page) {
        return PageResponse.<ReturnRequestResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
