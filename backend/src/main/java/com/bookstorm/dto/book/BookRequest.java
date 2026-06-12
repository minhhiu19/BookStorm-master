package com.bookstorm.dto.book;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BookRequest {
    @NotBlank(message = "Ten sach khong duoc de trong")
    private String name;
    private String description;
    @NotNull(message = "Danh muc khong duoc de trong")
    private Long categoryId;
    @NotBlank(message = "Tac gia khong duoc de trong")
    private String author;
    private String publisher;
    private String isbn;
    private Integer publishYear;
    private Integer pageCount;
    @NotNull(message = "So luong ton kho khong duoc de trong")
    private Integer stockQuantity;
    @NotNull(message = "Gia ban khong duoc de trong")
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private boolean featured;
    private boolean active;
    private List<String> imageUrls;
}
