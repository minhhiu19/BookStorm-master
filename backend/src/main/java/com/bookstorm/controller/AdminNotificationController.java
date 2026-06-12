package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.notification.BulkNotificationRequest;
import com.bookstorm.dto.notification.NotificationResponse;
import com.bookstorm.dto.notification.SendNotificationRequest;
import com.bookstorm.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<NotificationResponse>> sendNotification(
            @Valid @RequestBody SendNotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification sent successfully", response));
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<Integer>> sendBulkNotification(
            @Valid @RequestBody BulkNotificationRequest request) {
        int count = notificationService.sendBulkNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sent to " + count + " users", count));
    }
}
