package com.amalitech.communityboard.controller;

import com.amalitech.communityboard.dto.*;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal User user) {
        UserResponse data = accountService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<UserResponse>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        UserResponse data = accountService.changePassword(user, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully. Please login again.", data));
    }

    @PutMapping("/change-email")
    public ResponseEntity<ApiResponse<UserResponse>> changeEmail(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangeEmailRequest request,
            HttpServletRequest httpRequest) {
        UserResponse data = accountService.changeEmail(user, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Email changed. Please verify your new email.", data));
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {
        accountService.deleteAccount(user, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<Void>> logoutAll(
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {
        accountService.logoutAll(user, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("All sessions have been invalidated"));
    }
}
