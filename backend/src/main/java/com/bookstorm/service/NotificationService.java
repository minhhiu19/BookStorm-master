package com.bookstorm.service;

import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.notification.BulkNotificationRequest;
import com.bookstorm.dto.notification.NotificationResponse;
import com.bookstorm.dto.notification.SendNotificationRequest;
import com.bookstorm.model.Role;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Notification;
import com.bookstorm.model.User;
import com.bookstorm.repository.NotificationRepository;
import com.bookstorm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Notification createNotification(Long userId, String title, String message, Notification.Type type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    public Page<Notification> getNotificationsByUserId(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public PageResponse<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return toPageResponse(page);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public NotificationResponse markAsRead(Long userId, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", "id", id);
        }

        notification.setIsRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        Notification notification = createNotification(
                request.getUserId(),
                request.getTitle(),
                request.getMessage(),
                Notification.Type.valueOf(request.getType())
        );
        return toResponse(notification);
    }

    @Transactional
    public int sendBulkNotification(BulkNotificationRequest request) {
        List<User> allUsers = userRepository.findAll();
        Notification.Type type = Notification.Type.valueOf(request.getType());
        int count = 0;
        for (User user : allUsers) {
            Notification notification = Notification.builder()
                    .user(user)
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .type(type)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
            count++;
        }
        return count;
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private PageResponse<NotificationResponse> toPageResponse(Page<Notification> page) {
        List<NotificationResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<NotificationResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
