package com.bookstorm.repository;

import com.bookstorm.model.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    Page<Wishlist> findByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    void deleteByUserIdAndBookId(Long userId, Long bookId);
}
