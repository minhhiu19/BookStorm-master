package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.shipping.ShippingConfigRequest;
import com.bookstorm.dto.shipping.ShippingConfigResponse;
import com.bookstorm.dto.shipping.ShippingRequest;
import com.bookstorm.dto.shipping.ShippingResponse;
import com.bookstorm.service.ShippingConfigService;
import com.bookstorm.service.ShippingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/shipping")
@RequiredArgsConstructor
public class AdminShippingController {

    private final ShippingService shippingService;
    private final ShippingConfigService shippingConfigService;

    @PostMapping("/order/{orderCode}")
    public ResponseEntity<ApiResponse<ShippingResponse>> createShipping(
            @PathVariable String orderCode,
            @Valid @RequestBody ShippingRequest request) {
        ShippingResponse response = shippingService.createShipping(orderCode, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shipping created successfully", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ShippingResponse>> updateShippingStatus(
            @PathVariable Long id,
            @Valid @RequestBody ShippingRequest request) {
        ShippingResponse response = shippingService.updateShippingStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Shipping status updated", response));
    }

    @GetMapping("/order/{orderCode}")
    public ResponseEntity<ApiResponse<ShippingResponse>> getShippingByOrder(
            @PathVariable String orderCode) {
        ShippingResponse response = shippingService.getShippingByOrder(orderCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<ShippingConfigResponse>> getShippingConfig() {
        ShippingConfigResponse config = shippingConfigService.getConfig();
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PutMapping("/config")
    public ResponseEntity<ApiResponse<ShippingConfigResponse>> updateShippingConfig(
            @RequestBody ShippingConfigRequest request) {
        ShippingConfigResponse config = shippingConfigService.updateConfig(request);
        return ResponseEntity.ok(ApiResponse.success("Shipping config updated", config));
    }
}
