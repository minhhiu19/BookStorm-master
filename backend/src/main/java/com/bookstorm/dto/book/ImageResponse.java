package com.bookstorm.dto.book;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ImageResponse {
    private Long id;
    private String imageUrl;
    private boolean isPrimary;
    private int sortOrder;
}
