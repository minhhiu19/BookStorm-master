package com.bookstorm.dto.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Long parentCategoryId;
    private String parentCategoryName;
    private boolean active;
    private int productCount;
    private List<CategoryResponse> subcategories;
}
