package com.bookstorm.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddToCartRequest {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
}
