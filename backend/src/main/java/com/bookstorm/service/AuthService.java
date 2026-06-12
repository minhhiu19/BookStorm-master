package com.bookstorm.service;

import com.bookstorm.config.JwtUtil;
import com.bookstorm.dto.auth.RegisterRequest;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Role;
import com.bookstorm.model.User;
import com.bookstorm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId());
        String token = jwtUtil.generateToken(extraClaims, userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        return response;
    }

    public Map<String, Object> login(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!user.getEnabled()) {
            throw new BadRequestException("Account is disabled. Please contact support.");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId());
        String token = jwtUtil.generateToken(extraClaims, userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        return response;
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String resetToken = UUID.randomUUID().toString();

        // In production, send email with reset link containing the token
        // For now, return the token directly
        return resetToken;
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
