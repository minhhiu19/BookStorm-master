package com.bookstorm.service;

import com.bookstorm.dto.cart.CartItemResponse;
import com.bookstorm.dto.cart.CartResponse;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Book;
import com.bookstorm.model.Cart;
import com.bookstorm.model.CartItem;
import com.bookstorm.model.User;
import com.bookstorm.repository.BookRepository;
import com.bookstorm.repository.CartItemRepository;
import com.bookstorm.repository.CartRepository;
import com.bookstorm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    private Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Cart cart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public CartResponse getCartResponseByUserId(Long userId) {
        Cart cart = getCartByUserId(userId);
        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(Long userId, Long bookId, Integer quantity) {
        Cart cart = getCartByUserId(userId);

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        // Check stock
        if (book.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock. Available: " + book.getStockQuantity());
        }

        // Check if same book already in cart
        Optional<CartItem> existingItem = cartItemRepository
                .findByCartIdAndBookId(cart.getId(), bookId);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (book.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Insufficient stock. Available: " + book.getStockQuantity());
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .book(book)
                    .quantity(quantity)
                    .build();
            cartItemRepository.save(cartItem);
        }

        return getCartResponseByUserId(userId);
    }

    @Transactional
    public CartResponse updateCartItem(Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Book book = cartItem.getBook();
        if (book.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock. Available: " + book.getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return getCartResponseByUserId(cartItem.getCart().getUser().getId());
    }

    @Transactional
    public CartResponse removeCartItem(Long userId, Long cartItemId) {
        Cart cart = getCartByUserId(userId);
        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        cart.getCartItems().remove(cartItem);
        cartRepository.save(cart);
        return toCartResponse(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getCartItems().stream()
                .map(this::toCartItemResponse)
                .collect(Collectors.toList());

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .totalAmount(totalAmount)
                .totalItems(totalItems)
                .build();
    }

    private CartItemResponse toCartItemResponse(CartItem item) {
        Book book = item.getBook();

        BigDecimal price = book.getSalePrice() != null
                ? book.getSalePrice()
                : book.getBasePrice();

        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

        String primaryImage = book.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(img -> img.getImageUrl())
                .orElse(book.getImages().isEmpty() ? null : book.getImages().get(0).getImageUrl());

        return CartItemResponse.builder()
                .id(item.getId())
                .bookId(book.getId())
                .bookName(book.getName())
                .bookSlug(book.getSlug())
                .bookImage(primaryImage)
                .bookAuthor(book.getAuthor())
                .price(price)
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .inStock(book.getStockQuantity() > 0)
                .build();
    }
}
