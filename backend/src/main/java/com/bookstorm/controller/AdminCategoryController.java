package com.bookstorm.controller;

import com.bookstorm.dto.category.CategoryRequest;
import com.bookstorm.dto.category.CategoryResponse;
import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.model.Category;
import com.bookstorm.service.CategoryService;
import com.bookstorm.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        List<CategoryResponse> response = categoryService.getAllCategoryResponses();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse response = categoryService.getCategoryResponseById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        Category category = mapRequestToCategory(request);
        Category created = categoryService.createCategory(category);
        CategoryResponse response = categoryService.getCategoryResponseById(created.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        Category updatedData = mapRequestToCategory(request);
        categoryService.updateCategory(id, updatedData);
        CategoryResponse response = categoryService.getCategoryResponseById(id);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<ApiResponse<CategoryResponse>> uploadCategoryImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = cloudinaryService.uploadFile(file, "categories");
        categoryService.updateCategoryImage(id, imageUrl);
        CategoryResponse response = categoryService.getCategoryResponseById(id);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }

    private Category mapRequestToCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .active(request.isActive())
                .build();

        if (request.getParentCategoryId() != null) {
            Category parent = new Category();
            parent.setId(request.getParentCategoryId());
            category.setParentCategory(parent);
        }

        return category;
    }
}
