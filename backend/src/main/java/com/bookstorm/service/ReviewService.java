package com.bookstorm.service;

import com.bookstorm.dto.review.ReviewResponse;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Book;
import com.bookstorm.model.Order;
import com.bookstorm.model.Review;
import com.bookstorm.model.User;
import com.bookstorm.repository.BookRepository;
import com.bookstorm.repository.OrderRepository;
import com.bookstorm.repository.ReviewRepository;
import com.bookstorm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Review createReview(Long userId, Long bookId, Long orderId, Integer rating, String comment) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        // Check if user already reviewed this book
        if (reviewRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new BadRequestException("Ban da danh gia sach nay roi");
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Danh gia phai tu 1 den 5 sao");
        }

        Order order = null;
        if (orderId != null) {
            order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
            if (!order.getUser().getId().equals(userId)) {
                throw new BadRequestException("Don hang khong thuoc ve ban");
            }
            if (order.getStatus() != Order.Status.DELIVERED) {
                throw new BadRequestException("Ban chi co the danh gia sach tu don hang da giao");
            }
            boolean bookInOrder = order.getOrderItems().stream()
                    .anyMatch(item -> item.getBook() != null && item.getBook().getId().equals(bookId));
            if (!bookInOrder) {
                throw new BadRequestException("Sach khong co trong don hang nay");
            }
        } else {
            // Auto-find a delivered order containing this book
            java.util.List<Order> deliveredOrders = orderRepository.findByUserIdAndStatus(userId, Order.Status.DELIVERED);
            for (Order o : deliveredOrders) {
                boolean found = o.getOrderItems().stream()
                        .anyMatch(item -> item.getBook() != null && item.getBook().getId().equals(bookId));
                if (found) {
                    order = o;
                    break;
                }
            }
            if (order == null) {
                throw new BadRequestException("Ban can mua va nhan sach nay truoc khi danh gia");
            }
        }

        Review review = Review.builder()
                .user(user)
                .book(book)
                .order(order)
                .rating(rating)
                .comment(comment)
                .visible(true)
                .build();

        return reviewRepository.save(review);
    }

    public Page<Review> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable);
    }

    public Page<Review> getReviewsByBook(Long bookId, Pageable pageable) {
        return reviewRepository.findByBookIdAndVisibleTrue(bookId, pageable);
    }

    public Page<Review> getReviewsByUser(Long userId, Pageable pageable) {
        return reviewRepository.findByUserId(userId, pageable);
    }

    @Transactional
    public Review toggleReviewVisibility(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        review.setVisible(!review.getVisible());
        return reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReviewResponseById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        return toResponse(review);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        reviewRepository.delete(review);
    }

    public Double getAverageRating(Long bookId) {
        return reviewRepository.getAverageRatingByBookId(bookId);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewResponsesByBook(Long bookId, Pageable pageable) {
        return reviewRepository.findByBookIdAndVisibleTrue(bookId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviewResponses(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewResponsesByVisibility(Boolean visible, Pageable pageable) {
        return reviewRepository.findByVisible(visible, pageable).map(this::toResponse);
    }

    public ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getFullName() : null)
                .userAvatar(review.getUser() != null ? review.getUser().getAvatar() : null)
                .productId(review.getBook() != null ? review.getBook().getId() : null)
                .productName(review.getBook() != null ? review.getBook().getName() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .visible(review.getVisible())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
