package com.bookstorm.service;

import com.bookstorm.dto.banner.BannerRequest;
import com.bookstorm.dto.banner.BannerResponse;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Banner;
import com.bookstorm.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Page<BannerResponse> getBannersPaginated(Pageable pageable) {
        return bannerRepository.findAll(pageable).map(this::toResponse);
    }

    public BannerResponse getBannerById(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
        return toResponse(banner);
    }

    @Transactional
    public BannerResponse uploadBannerImage(Long id, MultipartFile file) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));

        if (file.isEmpty()) {
            throw new BadRequestException("File must not be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File must be an image");
        }

        try {
            Path uploadPath = Paths.get(uploadDir, "banners");
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            banner.setImageUrl("/uploads/banners/" + filename);
            return toResponse(bannerRepository.save(banner));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    @Transactional
    public BannerResponse toggleBannerActive(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));

        banner.setActive(banner.getActive() == null || !banner.getActive());
        return toResponse(bannerRepository.save(banner));
    }

    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BannerResponse> getAllBanners() {
        return bannerRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BannerResponse createBanner(BannerRequest request) {
        Banner banner = Banner.builder()
                .title(request.getTitle())
                .imageUrl(request.getImageUrl())
                .linkUrl(request.getLinkUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .active(request.isActive())
                .build();

        return toResponse(bannerRepository.save(banner));
    }

    @Transactional
    public BannerResponse updateBanner(Long id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));

        if (request.getTitle() != null) {
            banner.setTitle(request.getTitle());
        }
        if (request.getImageUrl() != null) {
            banner.setImageUrl(request.getImageUrl());
        }
        if (request.getLinkUrl() != null) {
            banner.setLinkUrl(request.getLinkUrl());
        }
        if (request.getSortOrder() != null) {
            banner.setSortOrder(request.getSortOrder());
        }
        banner.setActive(request.isActive());

        return toResponse(bannerRepository.save(banner));
    }

    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
        bannerRepository.delete(banner);
    }

    private BannerResponse toResponse(Banner banner) {
        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .imageUrl(banner.getImageUrl())
                .linkUrl(banner.getLinkUrl())
                .sortOrder(banner.getSortOrder())
                .active(banner.getActive() != null && banner.getActive())
                .createdAt(banner.getCreatedAt())
                .build();
    }
}
