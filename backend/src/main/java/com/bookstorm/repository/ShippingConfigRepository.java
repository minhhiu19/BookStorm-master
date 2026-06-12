package com.bookstorm.repository;

import com.bookstorm.model.ShippingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShippingConfigRepository extends JpaRepository<ShippingConfig, Long> {
    Optional<ShippingConfig> findByConfigKey(String configKey);
}
