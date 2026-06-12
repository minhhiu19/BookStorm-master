package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.dto.review.ReviewResponse;
import com.bookstorm.model.Review;
import com.bookstorm.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean visible) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReviewResponse> reviewPage = visible != null
                ? reviewService.getReviewResponsesByVisibility(visible, pageable)
                : reviewService.getAllReviewResponses(pageable);
        PageResponse<ReviewResponse> pageResponse = PageResponse.<ReviewResponse>builder()
                .content(reviewPage.getContent())
                .pageNumber(reviewPage.getNumber())
                .pageSize(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .last(reviewPage.isLast())
                .build();
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviewsByBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReviewResponse> reviewPage = reviewService.getReviewResponsesByBook(bookId, pageable);
        PageResponse<ReviewResponse> pageResponse = PageResponse.<ReviewResponse>builder()
                .content(reviewPage.getContent())
                .pageNumber(reviewPage.getNumber())
                .pageSize(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .last(reviewPage.isLast())
                .build();
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @PutMapping("/{id}/toggle-visibility")
    public ResponseEntity<ApiResponse<ReviewResponse>> toggleVisibility(@PathVariable Long id) {
        reviewService.toggleReviewVisibility(id);
        ReviewResponse response = reviewService.getReviewResponseById(id);
        return ResponseEntity.ok(ApiResponse.success("Review visibility toggled", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully"));
    }
}
