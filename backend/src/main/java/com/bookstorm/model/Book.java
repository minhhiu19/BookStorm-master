package com.bookstorm.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "books")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String author;

    private String publisher;

    @Column(length = 20, unique = true)
    private String isbn;

    private Integer publishYear;
    private Integer pageCount;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private Boolean featured = false;

    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();
}
