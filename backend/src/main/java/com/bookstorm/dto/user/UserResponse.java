package com.bookstorm.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatar;
    private String role;
    private boolean enabled;
    private LocalDateTime createdAt;
}
