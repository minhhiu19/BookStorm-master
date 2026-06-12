package com.bookstorm.repository;

import com.bookstorm.model.BookImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookImageRepository extends JpaRepository<BookImage, Long> {
    List<BookImage> findByBookIdOrderBySortOrder(Long bookId);
}
