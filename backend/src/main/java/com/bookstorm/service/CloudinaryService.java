package com.bookstorm.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "wearora/" + folder,
                        "resource_type", "auto"
                ));
        return (String) uploadResult.get("secure_url");
    }

    public String uploadFromUrl(String imageUrl, String folder) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(imageUrl,
                ObjectUtils.asMap(
                        "folder", "wearora/" + folder,
                        "resource_type", "auto"
                ));
        return (String) uploadResult.get("secure_url");
    }

    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    public String getPublicIdFromUrl(String url) {
        if (url == null || !url.contains("cloudinary")) return null;
        String[] parts = url.split("/upload/");
        if (parts.length < 2) return null;
        String path = parts[1];
        // Remove version prefix (v1234567890/)
        if (path.matches("^v\\d+/.*")) {
            path = path.substring(path.indexOf('/') + 1);
        }
        // Remove file extension
        int lastDot = path.lastIndexOf('.');
        if (lastDot > 0) {
            path = path.substring(0, lastDot);
        }
        return path;
    }
}
