package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.*;
import com.amalitech.communityboard.exception.ApiException;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.model.enums.AuthProvider;
import com.amalitech.communityboard.model.enums.EventType;
import com.amalitech.communityboard.repository.UserRepository;
import com.amalitech.communityboard.security.AuthTokenStore;
import com.amalitech.communityboard.security.JwtService;
import com.amalitech.communityboard.security.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuthTokenStore authTokenStore;
    private final EmailService emailService;

    public UserResponse getProfile(User user) {
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse changePassword(User currentUser, ChangePasswordRequest request, HttpServletRequest httpRequest) {

        User user = userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        if (user.getAuthProvider() != AuthProvider.MANUAL) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password change is not available for OAuth accounts.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        blacklistCurrentToken(httpRequest);

        return toUserResponse(user);
    }

    @Transactional
    public UserResponse changeEmail(User currentUser, ChangeEmailRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Password is incorrect");
        }

        String newEmail = request.getNewEmail().toLowerCase().trim();
        if (userRepository.existsByEmailAndDeletedAtIsNull(newEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already in use");
        }

        user.setEmail(newEmail);
        user.setEmailVerified(false);
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        String verificationToken = UUID.randomUUID().toString();
        authTokenStore.storeEmailVerificationToken(verificationToken, newEmail);
        emailService.sendVerificationEmail(newEmail, verificationToken);
        blacklistCurrentToken(httpRequest);

        return toUserResponse(user);
    }

    @Transactional
    public void deleteAccount(User currentUser, HttpServletRequest httpRequest) {
        User user = userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        user.setDeletedAt(LocalDateTime.now());
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        blacklistCurrentToken(httpRequest);
    }

    @Transactional
    public void logoutAll(User currentUser, HttpServletRequest httpRequest) {
        User user = userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        blacklistCurrentToken(httpRequest);
    }

    private void blacklistCurrentToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String jti = jwtService.extractJti(token);
                long remaining = jwtService.getRemainingMillis(token);
                tokenBlacklistService.blacklist(jti, remaining);
            } catch (Exception ignored) {
            }
        }
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .authProvider(user.getAuthProvider().name())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
