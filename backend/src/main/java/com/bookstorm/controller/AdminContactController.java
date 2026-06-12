package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.contact.ContactMessageResponse;
import com.bookstorm.service.ContactMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/contacts")
@RequiredArgsConstructor
public class AdminContactController {

    private final ContactMessageService contactMessageService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ContactMessageResponse>>> getAllMessages(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ContactMessageResponse> response;
        if (status != null && !status.isBlank()) {
            response = contactMessageService.getMessagesByStatus(status, pageable);
        } else {
            response = contactMessageService.getAllMessages(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        ContactMessageResponse response = contactMessageService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Long id) {
        contactMessageService.deleteMessage(id);
        return ResponseEntity.ok(ApiResponse.success("Message deleted"));
    }
}
