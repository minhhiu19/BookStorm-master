package com.bookstorm.dto.contact;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessageResponse {

    private Long id;
    private String name;
    private String email;
    private String subject;
    private String message;
    private String status;
    private LocalDateTime createdAt;
}
