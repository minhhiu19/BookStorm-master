package com.bookstorm.controller;

import com.bookstorm.dto.book.BookResponse;
import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.model.User;
import com.bookstorm.service.UserService;
import com.bookstorm.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getWishlist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Long userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<BookResponse> response = wishlistService.getWishlist(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{bookId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(@PathVariable Long bookId) {
        Long userId = getCurrentUserId();
        wishlistService.addToWishlist(userId, bookId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book added to wishlist"));
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(@PathVariable Long bookId) {
        Long userId = getCurrentUserId();
        wishlistService.removeFromWishlist(userId, bookId);
        return ResponseEntity.ok(ApiResponse.success("Book removed from wishlist"));
    }

    @GetMapping("/check/{bookId}")
    public ResponseEntity<ApiResponse<Boolean>> isInWishlist(@PathVariable Long bookId) {
        Long userId = getCurrentUserId();
        boolean result = wishlistService.isInWishlist(userId, bookId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userService.getUserByEmail(userDetails.getUsername());
        return user.getId();
    }
}
