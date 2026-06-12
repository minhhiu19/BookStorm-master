package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.returnrequest.ReturnRequestResponse;
import com.bookstorm.service.ReturnRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/admin/returns")
@RequiredArgsConstructor
public class AdminReturnController {

    private final ReturnRequestService returnRequestService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReturnRequestResponse>>> getAllReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ReturnRequestResponse> response = returnRequestService.getAllReturns(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/process")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> processReturn(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false) BigDecimal refundAmount) {
        ReturnRequestResponse response = returnRequestService.processReturn(id, approved, refundAmount);
        return ResponseEntity.ok(ApiResponse.success("Return request processed", response));
    }
}
