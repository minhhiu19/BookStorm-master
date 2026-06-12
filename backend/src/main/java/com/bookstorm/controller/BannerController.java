package com.bookstorm.controller;

import com.bookstorm.dto.banner.BannerResponse;
import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getActiveBanners() {
        List<BannerResponse> response = bannerService.getActiveBanners();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
