package com.bookstorm.service;

import com.bookstorm.dto.shipping.ShippingConfigRequest;
import com.bookstorm.dto.shipping.ShippingConfigResponse;
import com.bookstorm.model.ShippingConfig;
import com.bookstorm.repository.ShippingConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShippingConfigService {

    private final ShippingConfigRepository shippingConfigRepository;

    private static final String KEY_DEFAULT_FEE = "default_fee";
    private static final String KEY_FREE_THRESHOLD = "free_threshold";
    private static final String KEY_CARRIERS = "carriers";

    @Transactional(readOnly = true)
    public ShippingConfigResponse getConfig() {
        BigDecimal defaultFee = getConfigValue(KEY_DEFAULT_FEE, "30000");
        BigDecimal freeThreshold = getConfigValue(KEY_FREE_THRESHOLD, "500000");
        String carriersStr = getConfigStringValue(KEY_CARRIERS, "GHN,GHTK,J&T Express,Viettel Post");

        List<String> carriers = Arrays.stream(carriersStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        return ShippingConfigResponse.builder()
                .defaultFee(defaultFee)
                .freeThreshold(freeThreshold)
                .carriers(carriers)
                .build();
    }

    @Transactional
    public ShippingConfigResponse updateConfig(ShippingConfigRequest request) {
        if (request.getDefaultFee() != null) {
            saveConfig(KEY_DEFAULT_FEE, request.getDefaultFee().toString(), "Phi van chuyen mac dinh");
        }
        if (request.getFreeThreshold() != null) {
            saveConfig(KEY_FREE_THRESHOLD, request.getFreeThreshold().toString(), "Mien phi ship cho don tu");
        }
        if (request.getCarriers() != null) {
            String carriersStr = String.join(",", request.getCarriers());
            saveConfig(KEY_CARRIERS, carriersStr, "Danh sach don vi van chuyen");
        }
        return getConfig();
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateShippingFee(BigDecimal orderTotal) {
        BigDecimal defaultFee = getConfigValue(KEY_DEFAULT_FEE, "30000");
        BigDecimal freeThreshold = getConfigValue(KEY_FREE_THRESHOLD, "500000");

        if (orderTotal.compareTo(freeThreshold) >= 0) {
            return BigDecimal.ZERO;
        }
        return defaultFee;
    }

    private BigDecimal getConfigValue(String key, String defaultValue) {
        return new BigDecimal(getConfigStringValue(key, defaultValue));
    }

    private String getConfigStringValue(String key, String defaultValue) {
        return shippingConfigRepository.findByConfigKey(key)
                .map(ShippingConfig::getConfigValue)
                .orElse(defaultValue);
    }

    private void saveConfig(String key, String value, String description) {
        ShippingConfig config = shippingConfigRepository.findByConfigKey(key)
                .orElse(ShippingConfig.builder().configKey(key).build());
        config.setConfigValue(value);
        config.setDescription(description);
        shippingConfigRepository.save(config);
    }
}
