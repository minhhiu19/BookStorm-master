package com.bookstorm.dto.banner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerResponse {

    private Long id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private Integer sortOrder;
    private boolean active;
    private LocalDateTime createdAt;
}
