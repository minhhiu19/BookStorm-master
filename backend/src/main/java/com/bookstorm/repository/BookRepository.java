package com.bookstorm.repository;

import com.bookstorm.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
    Optional<Book> findBySlug(String slug);
    Page<Book> findByActiveTrue(Pageable pageable);
    List<Book> findByFeaturedTrueAndActiveTrue();
    Page<Book> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);
    long countByActiveTrue();
    long countByCategoryId(Long categoryId);

    @Query("SELECT b FROM Book b WHERE b.active = true AND " +
           "(LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Book> search(@Param("keyword") String keyword, Pageable pageable);

    Page<Book> findByAuthorContainingIgnoreCaseAndActiveTrue(String author, Pageable pageable);
    Page<Book> findByPublisherContainingIgnoreCaseAndActiveTrue(String publisher, Pageable pageable);
    Page<Book> findByPublishYearAndActiveTrue(Integer publishYear, Pageable pageable);
    Page<Book> findByBasePriceBetweenAndActiveTrue(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    boolean existsByIsbn(String isbn);
}
