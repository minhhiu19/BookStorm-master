package com.bookstorm.service;

import com.bookstorm.dto.book.BookResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Book;
import com.bookstorm.model.User;
import com.bookstorm.model.Wishlist;
import com.bookstorm.repository.BookRepository;
import com.bookstorm.repository.UserRepository;
import com.bookstorm.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BookService bookService;

    @Transactional(readOnly = true)
    public Page<Wishlist> getWishlistByUserId(Long userId, Pageable pageable) {
        return wishlistRepository.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookResponse> getWishlist(Long userId, Pageable pageable) {
        Page<Wishlist> page = wishlistRepository.findByUserId(userId, pageable);

        List<BookResponse> content = page.getContent().stream()
                .map(wishlist -> bookService.toResponse(wishlist.getBook()))
                .collect(Collectors.toList());

        return PageResponse.<BookResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Transactional
    public Wishlist addToWishlist(Long userId, Long bookId) {
        if (wishlistRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new BadRequestException("Book already in wishlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .book(book)
                .build();

        return wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long bookId) {
        if (!wishlistRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new ResourceNotFoundException("Wishlist item not found for user " + userId + " and book " + bookId);
        }
        wishlistRepository.deleteByUserIdAndBookId(userId, bookId);
    }

    public boolean isInWishlist(Long userId, Long bookId) {
        return wishlistRepository.existsByUserIdAndBookId(userId, bookId);
    }
}
