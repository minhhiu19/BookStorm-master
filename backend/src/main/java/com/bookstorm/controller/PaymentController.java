package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.payment.VnpayRequest;
import com.bookstorm.model.Order;
import com.bookstorm.model.Payment;
import com.bookstorm.service.OrderService;
import com.bookstorm.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @PostMapping("/vnpay/create")
    public ResponseEntity<ApiResponse<String>> createVnpayPayment(
            @Valid @RequestBody VnpayRequest request,
            HttpServletRequest httpRequest) {
        Order order = orderService.getOrderByCode(request.getOrderCode());
        String ipAddress = httpRequest.getRemoteAddr();
        String paymentUrl = paymentService.createVnpayPayment(order.getId(), ipAddress);
        return ResponseEntity.ok(ApiResponse.success("VNPay payment URL created", paymentUrl));
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> processVnpayReturn(@RequestParam Map<String, String> params) {
        Payment payment = paymentService.processVnpayReturn(params);
        String redirectUrl;
        if (payment.getStatus() == Payment.Status.SUCCESS) {
            redirectUrl = frontendUrl + "/order/success?code=" + payment.getOrder().getOrderCode();
        } else {
            redirectUrl = frontendUrl + "/order/failed?code=" + payment.getOrder().getOrderCode();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirectUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
