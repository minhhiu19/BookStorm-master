package com.bookstorm.service;

import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Order;
import com.bookstorm.model.Payment;
import com.bookstorm.repository.OrderRepository;
import com.bookstorm.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;

    @Value("${vnpay.url}")
    private String vnpPayUrl;

    @Value("${vnpay.return-url}")
    private String vnpReturnUrl;

    @Transactional
    public String createVnpayPayment(Long orderId, String ipAddress) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getPaymentMethod() != Order.PaymentMethod.VNPAY) {
            throw new BadRequestException("Order payment method is not VNPAY");
        }

        // Amount in VNPay is in VND * 100
        long amount = order.getFinalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        String vnpTxnRef = order.getOrderCode();
        String vnpCreateDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        SortedMap<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpTmnCode);
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", vnpTxnRef);
        params.put("vnp_OrderInfo", "Payment for order " + order.getOrderCode());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpReturnUrl);
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", vnpCreateDate);

        // Build query string and hash
        StringBuilder queryBuilder = new StringBuilder();
        StringBuilder hashDataBuilder = new StringBuilder();

        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (hashDataBuilder.length() > 0) {
                hashDataBuilder.append("&");
                queryBuilder.append("&");
            }
            hashDataBuilder.append(entry.getKey()).append("=").append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            queryBuilder.append(entry.getKey()).append("=").append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
        }

        String secureHash = hmacSHA512(vnpHashSecret, hashDataBuilder.toString());
        queryBuilder.append("&vnp_SecureHash=").append(secureHash);

        // Create payment record
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod("VNPAY")
                .amount(order.getFinalAmount())
                .transactionId(vnpTxnRef)
                .status(Payment.Status.PENDING)
                .build();
        paymentRepository.save(payment);

        return vnpPayUrl + "?" + queryBuilder.toString();
    }

    @Transactional
    public Payment processVnpayReturn(Map<String, String> vnpParams) {
        String vnpSecureHash = vnpParams.get("vnp_SecureHash");

        // Remove hash params for verification
        SortedMap<String, String> sortedParams = new TreeMap<>();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            if (!entry.getKey().equals("vnp_SecureHash") && !entry.getKey().equals("vnp_SecureHashType")) {
                sortedParams.put(entry.getKey(), entry.getValue());
            }
        }

        // Build hash data
        StringBuilder hashDataBuilder = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (hashDataBuilder.length() > 0) {
                hashDataBuilder.append("&");
            }
            hashDataBuilder.append(entry.getKey()).append("=").append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
        }

        String calculatedHash = hmacSHA512(vnpHashSecret, hashDataBuilder.toString());

        if (!calculatedHash.equalsIgnoreCase(vnpSecureHash)) {
            throw new BadRequestException("Invalid VNPay signature");
        }

        String vnpTxnRef = vnpParams.get("vnp_TxnRef");
        String responseCode = vnpParams.get("vnp_ResponseCode");

        Payment payment = paymentRepository.findByTransactionId(vnpTxnRef)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "transactionId", vnpTxnRef));

        Order order = payment.getOrder();

        if ("00".equals(responseCode)) {
            // Payment successful
            payment.setStatus(Payment.Status.SUCCESS);
            payment.setVnpayResponseCode(responseCode);
            payment.setPaidAt(LocalDateTime.now());

            order.setPaymentStatus(Order.PaymentStatus.PAID);
        } else {
            // Payment failed
            payment.setStatus(Payment.Status.FAILED);
            payment.setVnpayResponseCode(responseCode);
        }

        orderRepository.save(order);
        return paymentRepository.save(payment);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new BadRequestException("Error generating VNPay hash: " + e.getMessage());
        }
    }
}
