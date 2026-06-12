package com.bookstorm.controller;

import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.user.AddressRequest;
import com.bookstorm.model.Address;
import com.bookstorm.model.User;
import com.bookstorm.dto.user.UpdateProfileRequest;
import com.bookstorm.service.AddressService;
import com.bookstorm.service.CloudinaryService;
import com.bookstorm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AddressService addressService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile() {
        Long userId = getCurrentUserId();
        User response = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @RequestParam("file") MultipartFile file) throws java.io.IOException {
        Long userId = getCurrentUserId();
        String avatarUrl = cloudinaryService.uploadFile(file, "avatars");
        User updatedData = User.builder().avatar(avatarUrl).build();
        userService.updateProfile(userId, updatedData);
        return ResponseEntity.ok(ApiResponse.success("Avatar updated successfully", avatarUrl));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = getCurrentUserId();
        User updatedData = User.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .avatar(request.getAvatar())
                .build();
        User response = userService.updateProfile(userId, updatedData);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<Address>>> getAddresses() {
        Long userId = getCurrentUserId();
        List<Address> response = addressService.getAddressesByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<Address>> addAddress(
            @Valid @RequestBody AddressRequest request) {
        Long userId = getCurrentUserId();
        Address address = Address.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .addressDetail(request.getAddressDetail())
                .isDefault(request.isDefault())
                .build();
        Address response = addressService.addAddress(userId, address);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address added successfully", response));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Address>> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        Address updatedData = Address.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .addressDetail(request.getAddressDetail())
                .isDefault(request.isDefault())
                .build();
        Address response = addressService.updateAddress(id, updatedData);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully"));
    }

    @PutMapping("/addresses/{id}/default")
    public ResponseEntity<ApiResponse<Address>> setDefaultAddress(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        Address response = addressService.setDefaultAddress(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated", response));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody java.util.Map<String, String> request) {
        Long userId = getCurrentUserId();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        userService.changePassword(userId, oldPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userService.getUserByEmail(userDetails.getUsername());
        return user.getId();
    }
}
