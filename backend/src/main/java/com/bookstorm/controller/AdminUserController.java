package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.user.UserResponse;
import com.bookstorm.model.Role;
import com.bookstorm.model.User;
import com.bookstorm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserResponse> userPage;
        if (search != null && !search.trim().isEmpty()) {
            userPage = userService.searchUserResponses(search.trim(), pageable);
        } else {
            userPage = userService.getAllUserResponses(pageable);
        }
        PageResponse<UserResponse> pageResponse = PageResponse.<UserResponse>builder()
                .content(userPage.getContent())
                .pageNumber(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        UserResponse response = userService.toUserResponse(user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Role role = Role.valueOf(body.get("role").toUpperCase());
        User user = userService.updateUserRole(id, role);
        UserResponse response = userService.toUserResponse(user);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", response));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(@PathVariable Long id) {
        User user = userService.toggleUserStatus(id);
        UserResponse response = userService.toUserResponse(user);
        return ResponseEntity.ok(ApiResponse.success("User status toggled successfully", response));
    }
}
