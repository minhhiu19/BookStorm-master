package com.bookstorm.dto.book;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BookResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String author;
    private String publisher;
    private String isbn;
    private Integer publishYear;
    private Integer pageCount;
    private Integer stockQuantity;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private boolean featured;
    private boolean active;
    private double averageRating;
    private int reviewCount;
    private LocalDateTime createdAt;
    private List<ImageResponse> images;
}
