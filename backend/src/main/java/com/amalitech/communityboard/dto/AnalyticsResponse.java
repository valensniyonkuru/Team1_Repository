package com.amalitech.communityboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private long totalPosts;
    private long totalUsers;
    private long totalComments;
    private Map<String, Long> categories;
}
