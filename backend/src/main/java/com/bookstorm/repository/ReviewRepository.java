package com.bookstorm.repository;

import com.bookstorm.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByBookId(Long bookId, Pageable pageable);

    Page<Review> findByUserId(Long userId, Pageable pageable);

    Page<Review> findByBookIdAndVisibleTrue(Long bookId, Pageable pageable);

    Page<Review> findByVisible(Boolean visible, Pageable pageable);

    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    long countByBookId(Long bookId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.book.id = :bookId AND r.visible = true")
    Double getAverageRatingByBookId(@Param("bookId") Long bookId);
}
