package com.bookstorm.controller;

import com.bookstorm.dto.category.CategoryResponse;
import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> response = categoryService.getAllCategoryResponses();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRootCategories() {
        List<CategoryResponse> response = categoryService.getRootCategoryResponses();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse response = categoryService.getCategoryResponseById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        CategoryResponse response = categoryService.getCategoryResponseBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
