package com.bookstorm.dto.banner;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    private String linkUrl;

    private Integer sortOrder;

    private boolean active;
}
