package com.bookstorm.controller;

import com.bookstorm.dto.banner.BannerRequest;
import com.bookstorm.dto.banner.BannerResponse;
import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.service.BannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BannerResponse>>> getAllBannersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BannerResponse> response = bannerService.getBannersPaginated(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> getBannerById(@PathVariable Long id) {
        BannerResponse response = bannerService.getBannerById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BannerResponse>> uploadBannerImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        BannerResponse response = bannerService.uploadBannerImage(id, file);
        return ResponseEntity.ok(ApiResponse.success("Banner image uploaded successfully", response));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<BannerResponse>> toggleBannerActive(@PathVariable Long id) {
        BannerResponse response = bannerService.toggleBannerActive(id);
        return ResponseEntity.ok(ApiResponse.success("Banner active status toggled", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(
            @Valid @RequestBody BannerRequest request) {
        BannerResponse response = bannerService.createBanner(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Banner created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody BannerRequest request) {
        BannerResponse response = bannerService.updateBanner(id, request);
        return ResponseEntity.ok(ApiResponse.success("Banner updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted successfully"));
    }
}
