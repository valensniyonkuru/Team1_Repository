package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.*;
import com.amalitech.communityboard.exception.ApiException;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.model.enums.AuthProvider;
import com.amalitech.communityboard.model.enums.EventType;
import com.amalitech.communityboard.model.enums.Role;
import com.amalitech.communityboard.repository.UserRepository;
import com.amalitech.communityboard.security.AuthTokenStore;
import com.amalitech.communityboard.security.JwtService;
import com.amalitech.communityboard.security.RateLimiterService;
import com.amalitech.communityboard.security.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuthTokenStore authTokenStore;
    private final EmailService emailService;
    private final RateLimiterService rateLimiterService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Registration failed.User already exist Please try with a different email.");
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .authProvider(AuthProvider.MANUAL)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        try {
            authTokenStore.storeEmailVerificationToken(verificationToken, user.getEmail());
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            log.warn("Could not store verification token or send email (Redis/mail may be unavailable): {}", e.getMessage());
        }

        try {
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);
            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtService.getAccessTokenExpiration())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .emailVerified(user.isEmailVerified())
                    .build();
        } catch (Throwable t) {
            log.error("Token generation failed after register; re-fetching user", t);
            User persisted = userRepository.findByEmailAndDeletedAtIsNull(email)
                    .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Registration saved but user could not be retrieved"));
            try {
                String accessToken = jwtService.generateAccessToken(persisted);
                String refreshToken = jwtService.generateRefreshToken(persisted);
                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .expiresIn(jwtService.getAccessTokenExpiration())
                        .email(persisted.getEmail())
                        .name(persisted.getName())
                        .role(persisted.getRole().name())
                        .emailVerified(persisted.isEmailVerified())
                        .build();
            } catch (Throwable t2) {
                log.error("Token generation failed even after refetch", t2);
                throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Registration succeeded. Please try logging in.");
            }
        }
    }

    @Transactional
    public AuthResponse login(AuthRequest request, HttpServletRequest httpRequest) {
        String ip = extractClientIp(httpRequest);
        String email = request.getEmail().toLowerCase().trim();

        if (!rateLimiterService.tryConsume(ip)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many login attempts. Please try again later.");
        }

        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> {
                    return new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                });

        if (user.getAuthProvider() != AuthProvider.MANUAL) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please use " + user.getAuthProvider().name() + " to sign in.");
        }


        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        String email = jwtService.extractEmailFromRefreshToken(refreshToken);
        int tokenVersion = jwtService.extractVersionFromRefreshToken(refreshToken);

        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .filter(u -> u.getTokenVersion() == tokenVersion)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        String oldJti = jwtService.extractJtiFromRefreshToken(refreshToken);
        long remaining = jwtService.getRemainingMillisFromRefreshToken(refreshToken);
        tokenBlacklistService.blacklist(oldJti, remaining);

        return buildAuthResponse(user);
    }

    public void logout(HttpServletRequest request) {
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

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        String email = authTokenStore.getAndDeleteEmailVerificationToken(request.getToken())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired verification token"));

        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid verification token"));

        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(ResendVerificationRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        userRepository.findByEmailAndDeletedAtIsNull(email)
                .filter(user -> !user.isEmailVerified())
                .ifPresent(user -> {
                    String token = UUID.randomUUID().toString();
                    authTokenStore.storeEmailVerificationToken(token, email);
                    emailService.sendVerificationEmail(email, token);
                });
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail().toLowerCase().trim();

        userRepository.findByEmailAndDeletedAtIsNull(email)
                .filter(user -> user.getAuthProvider() == AuthProvider.MANUAL)
                .ifPresent(user -> {
                    String token = UUID.randomUUID().toString();
                    authTokenStore.storePasswordResetToken(token, email);
                    emailService.sendPasswordResetEmail(email, token);
                });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request, HttpServletRequest httpRequest) {
        if (!request.getPassword().equals(request.getPasswordConfirmation())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        String email = authTokenStore.getAndDeletePasswordResetToken(request.getToken())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid reset token"));

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }


    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getAccessTokenExpiration())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
