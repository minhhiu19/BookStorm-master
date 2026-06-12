package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.contact.ContactMessageRequest;
import com.bookstorm.dto.contact.ContactMessageResponse;
import com.bookstorm.service.ContactMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactMessageService contactMessageService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContactMessageResponse>> sendMessage(
            @Valid @RequestBody ContactMessageRequest request) {
        ContactMessageResponse response = contactMessageService.createMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Message sent successfully", response));
    }
}
