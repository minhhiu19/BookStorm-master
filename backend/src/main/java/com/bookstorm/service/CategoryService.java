package com.bookstorm.service;

import com.bookstorm.dto.category.CategoryResponse;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Category;
import com.bookstorm.repository.CategoryRepository;
import com.bookstorm.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Category> getRootCategories() {
        return categoryRepository.findByParentCategoryIsNull();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
    }

    @Transactional
    public Category createCategory(Category category) {
        String slug = generateSlug(category.getName());

        // Ensure slug uniqueness
        String originalSlug = slug;
        int counter = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = originalSlug + "-" + counter;
            counter++;
        }
        category.setSlug(slug);

        if (category.getParentCategory() != null && category.getParentCategory().getId() != null) {
            Category parent = categoryRepository.findById(category.getParentCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", category.getParentCategory().getId()));
            category.setParentCategory(parent);
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category updatedData) {
        Category category = getCategoryById(id);

        if (updatedData.getName() != null) {
            category.setName(updatedData.getName());
            // Regenerate slug if name changes
            String slug = generateSlug(updatedData.getName());
            String originalSlug = slug;
            int counter = 1;
            while (categoryRepository.existsBySlug(slug) && !slug.equals(category.getSlug())) {
                slug = originalSlug + "-" + counter;
                counter++;
            }
            category.setSlug(slug);
        }
        if (updatedData.getDescription() != null) {
            category.setDescription(updatedData.getDescription());
        }
        if (updatedData.getImageUrl() != null) {
            category.setImageUrl(updatedData.getImageUrl());
        }
        if (updatedData.getActive() != null) {
            category.setActive(updatedData.getActive());
        }
        if (updatedData.getParentCategory() != null) {
            if (updatedData.getParentCategory().getId() != null) {
                if (updatedData.getParentCategory().getId().equals(id)) {
                    throw new BadRequestException("Category cannot be its own parent");
                }
                Category parent = categoryRepository.findById(updatedData.getParentCategory().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category", "id", updatedData.getParentCategory().getId()));
                category.setParentCategory(parent);
            } else {
                category.setParentCategory(null);
            }
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public void updateCategoryImage(Long id, String imageUrl) {
        Category category = getCategoryById(id);
        category.setImageUrl(imageUrl);
        categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        if (bookRepository.countByCategoryId(id) > 0) {
            throw new BadRequestException("Cannot delete category with existing books");
        }
        List<Category> subcategories = categoryRepository.findByParentCategoryId(id);
        if (!subcategories.isEmpty()) {
            throw new BadRequestException("Cannot delete category with existing subcategories");
        }
        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoryResponses() {
        return categoryRepository.findAllWithParent().stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategoryResponses() {
        return categoryRepository.findRootWithParent().stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryResponseById(Long id) {
        Category category = categoryRepository.findByIdWithParent(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return toCategoryResponse(category);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryResponseBySlug(String slug) {
        Category category = categoryRepository.findBySlugWithParent(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return toCategoryResponse(category);
    }

    public CategoryResponse toCategoryResponse(Category category) {
        long productCount = bookRepository.countByCategoryId(category.getId());
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .parentCategoryName(category.getParentCategory() != null ? category.getParentCategory().getName() : null)
                .active(category.getActive() != null ? category.getActive() : true)
                .productCount((int) productCount)
                .build();
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
