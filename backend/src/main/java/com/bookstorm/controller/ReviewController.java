package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.review.ReviewRequest;
import com.bookstorm.dto.review.ReviewResponse;
import com.bookstorm.model.Review;
import com.bookstorm.model.User;
import com.bookstorm.service.ReviewService;
import com.bookstorm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewRequest request) {
        Long userId = getCurrentUserId();
        Review review = reviewService.createReview(userId, request.getBookId(),
                request.getOrderId(), request.getRating(), request.getComment());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created successfully", reviewService.toResponse(review)));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviewsByBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReviewResponse> response = reviewService.getReviewResponsesByBook(bookId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userService.getUserByEmail(userDetails.getUsername());
        return user.getId();
    }
}
