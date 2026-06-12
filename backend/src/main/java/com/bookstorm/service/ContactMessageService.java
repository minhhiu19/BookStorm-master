package com.bookstorm.service;

import com.bookstorm.dto.contact.ContactMessageRequest;
import com.bookstorm.dto.contact.ContactMessageResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.ContactMessage;
import com.bookstorm.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactMessageResponse createMessage(ContactMessageRequest request) {
        ContactMessage message = ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();
        message = contactMessageRepository.save(message);
        return toResponse(message);
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactMessageResponse> getAllMessages(Pageable pageable) {
        Page<ContactMessage> page = contactMessageRepository.findAll(pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactMessageResponse> getMessagesByStatus(String status, Pageable pageable) {
        ContactMessage.Status statusEnum = ContactMessage.Status.valueOf(status.toUpperCase());
        Page<ContactMessage> page = contactMessageRepository.findByStatus(statusEnum, pageable);
        return toPageResponse(page);
    }

    @Transactional
    public ContactMessageResponse updateStatus(Long id, String status) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ContactMessage", "id", id));
        message.setStatus(ContactMessage.Status.valueOf(status.toUpperCase()));
        message = contactMessageRepository.save(message);
        return toResponse(message);
    }

    @Transactional
    public void deleteMessage(Long id) {
        if (!contactMessageRepository.existsById(id)) {
            throw new ResourceNotFoundException("ContactMessage", "id", id);
        }
        contactMessageRepository.deleteById(id);
    }

    private ContactMessageResponse toResponse(ContactMessage msg) {
        return ContactMessageResponse.builder()
                .id(msg.getId())
                .name(msg.getName())
                .email(msg.getEmail())
                .subject(msg.getSubject())
                .message(msg.getMessage())
                .status(msg.getStatus().name())
                .createdAt(msg.getCreatedAt())
                .build();
    }

    private PageResponse<ContactMessageResponse> toPageResponse(Page<ContactMessage> page) {
        return PageResponse.<ContactMessageResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
