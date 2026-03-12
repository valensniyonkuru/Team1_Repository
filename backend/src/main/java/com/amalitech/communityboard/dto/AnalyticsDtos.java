package com.amalitech.communityboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

public class AnalyticsDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyActivity {
        private LocalDate date;
        private String category;
        private Long postCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserEngagement {
        private String authorEmail;
        private String authorName;
        private Long postsCreated;
        private Long commentsMade;
        private Long totalEngagement;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryTrend {
        private String category;
        private Long totalPosts;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopContributor {
        private String authorName;
        private String authorEmail;
        private Long postsCreated;
        private Long commentsMade;
        private Long totalEngagement;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContentStat {
        private LocalDate date;
        private Double avgTitleLen;
        private Double avgContentLen;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Overview {
        private List<DailyActivity> dailyActivity;
        private List<UserEngagement> userEngagement;
        private List<CategoryTrend> categoryTrends;
        private List<TopContributor> topContributors;
        private List<ContentStat> contentStats;
    }
}

