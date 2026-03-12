package com.amalitech.communityboard.controller;

import com.amalitech.communityboard.dto.AnalyticsDtos;
import com.amalitech.communityboard.dto.ApiResponse;
import com.amalitech.communityboard.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public CompletableFuture<ResponseEntity<ApiResponse<AnalyticsDtos.Overview>>> getOverview() {
        return analyticsService.getOverviewAsync()
                .thenApply(overview -> ResponseEntity.ok(ApiResponse.success(overview)));
    }
}

