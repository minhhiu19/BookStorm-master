package com.bookstorm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shippings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipping {

    public enum Status {
        PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    private String trackingCode;

    private String carrier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    private LocalDateTime estimatedDelivery;

    private LocalDateTime shippedAt;

    private LocalDateTime deliveredAt;

    private String note;
}
