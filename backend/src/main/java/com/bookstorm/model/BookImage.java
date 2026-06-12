package com.bookstorm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "book_images")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BookImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private String imageUrl;

    @Builder.Default
    private Boolean isPrimary = false;

    @Builder.Default
    private Integer sortOrder = 0;
}
