package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.returnrequest.ReturnRequestDTO;
import com.bookstorm.dto.returnrequest.ReturnRequestResponse;
import com.bookstorm.model.User;
import com.bookstorm.service.ReturnRequestService;
import com.bookstorm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnRequestService returnRequestService;
    private final UserService userService;

    @PostMapping("/order/{orderCode}")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> createReturnRequest(
            @PathVariable String orderCode,
            @Valid @RequestBody ReturnRequestDTO request) {
        Long userId = getCurrentUserId();
        ReturnRequestResponse response = returnRequestService.createReturnRequest(userId, orderCode, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Return request created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReturnRequestResponse>>> getMyReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ReturnRequestResponse> response = returnRequestService.getMyReturns(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userService.getUserByEmail(userDetails.getUsername());
        return user.getId();
    }
}
