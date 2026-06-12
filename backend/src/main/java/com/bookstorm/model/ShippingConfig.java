package com.bookstorm.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", unique = true, nullable = false)
    private String configKey;

    @Column(name = "config_value", nullable = false)
    private String configValue;

    @Column(name = "description")
    private String description;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
