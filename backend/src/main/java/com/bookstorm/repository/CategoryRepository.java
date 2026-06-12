package com.bookstorm.repository;

import com.bookstorm.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parentCategory WHERE c.id = :id")
    Optional<Category> findByIdWithParent(@Param("id") Long id);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parentCategory WHERE c.slug = :slug")
    Optional<Category> findBySlugWithParent(@Param("slug") String slug);

    Optional<Category> findBySlug(String slug);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parentCategory")
    List<Category> findAllWithParent();

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parentCategory WHERE c.parentCategory IS NULL")
    List<Category> findRootWithParent();

    List<Category> findByParentCategoryIsNull();

    List<Category> findByActiveTrue();

    List<Category> findByParentCategoryId(Long parentId);

    boolean existsBySlug(String slug);
}
