package com.bookstorm.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String imageUrl;

    private String linkUrl;

    @Builder.Default
    private Integer sortOrder = 0;

    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
