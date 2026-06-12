package com.bookstorm.controller;

import com.bookstorm.dto.cart.AddToCartRequest;
import com.bookstorm.dto.cart.CartResponse;
import com.bookstorm.dto.cart.UpdateCartItemRequest;
import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.model.User;
import com.bookstorm.service.CartService;
import com.bookstorm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        Long userId = getCurrentUserId();
        CartResponse response = cartService.getCartResponseByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @Valid @RequestBody AddToCartRequest request) {
        Long userId = getCurrentUserId();
        CartResponse response = cartService.addToCart(userId, request.getBookId(),
                request.getQuantity());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item added to cart", response));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse response = cartService.updateCartItem(itemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", response));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(@PathVariable Long itemId) {
        Long userId = getCurrentUserId();
        CartResponse response = cartService.removeCartItem(userId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", response));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        Long userId = getCurrentUserId();
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userService.getUserByEmail(userDetails.getUsername());
        return user.getId();
    }
}
