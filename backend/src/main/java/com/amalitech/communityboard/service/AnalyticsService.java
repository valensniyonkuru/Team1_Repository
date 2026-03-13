package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.AnalyticsDtos;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final int DAILY_ACTIVITY_DAYS = 30;
    private static final int TOP_CONTRIBUTORS_LIMIT = 10;
    private static final int USER_ENGAGEMENT_LIMIT = 50;
    private static final int CONTENT_STATS_DAYS = 30;

    private final JdbcTemplate jdbcTemplate;

    public CompletableFuture<AnalyticsDtos.Overview> getOverviewAsync() {
        CompletableFuture<List<AnalyticsDtos.DailyActivity>> dailyActivityFuture = getDailyActivityAsync();
        CompletableFuture<List<AnalyticsDtos.UserEngagement>> userEngagementFuture = getUserEngagementAsync();
        CompletableFuture<List<AnalyticsDtos.CategoryTrend>> categoryTrendsFuture = getCategoryTrendsAsync();
        CompletableFuture<List<AnalyticsDtos.TopContributor>> topContributorsFuture = getTopContributorsAsync();
        CompletableFuture<List<AnalyticsDtos.ContentStat>> contentStatsFuture = getContentStatsAsync();
        CompletableFuture<List<AnalyticsDtos.PostsByDayOfWeek>> postsByDayOfWeekFuture = getPostsByDayOfWeekAsync();

        return CompletableFuture.allOf(
                        dailyActivityFuture,
                        userEngagementFuture,
                        categoryTrendsFuture,
                        topContributorsFuture,
                        contentStatsFuture,
                        postsByDayOfWeekFuture
                )
                .thenApply(ignored -> AnalyticsDtos.Overview.builder()
                        .dailyActivity(dailyActivityFuture.join())
                        .userEngagement(userEngagementFuture.join())
                        .categoryTrends(categoryTrendsFuture.join())
                        .topContributors(topContributorsFuture.join())
                        .contentStats(contentStatsFuture.join())
                        .postsByDayOfWeek(postsByDayOfWeekFuture.join())
                        .build())
                .exceptionally(ex -> {
                    Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
                    throw new RuntimeException("Analytics overview failed: " + cause.getMessage(), cause);
                });
    }

    @Async
    public CompletableFuture<List<AnalyticsDtos.DailyActivity>> getDailyActivityAsync() {
        LocalDate since = LocalDate.now().minusDays(DAILY_ACTIVITY_DAYS);
        String sql = """
                SELECT date, category, post_count
                FROM analytics_daily_activity
                WHERE date >= ?
                ORDER BY date DESC, category ASC
                """;

        List<AnalyticsDtos.DailyActivity> result = jdbcTemplate.query(sql, (rs, rowNum) -> {
            LocalDate date = rs.getObject("date", LocalDate.class);
            return AnalyticsDtos.DailyActivity.builder()
                    .date(date)
                    .category(rs.getString("category"))
                    .postCount(rs.getLong("post_count"))
                    .build();
        }, since);
        return CompletableFuture.completedFuture(result);
    }

    @Async
    public CompletableFuture<List<AnalyticsDtos.UserEngagement>> getUserEngagementAsync() {
        String sql = """
                SELECT author_email,
                       author_name,
                       posts_created,
                       comments_made,
                       total_engagement
                FROM analytics_user_engagement
                ORDER BY total_engagement DESC
                LIMIT ?
                """;

        List<AnalyticsDtos.UserEngagement> result = jdbcTemplate.query(sql, (rs, rowNum) ->
                AnalyticsDtos.UserEngagement.builder()
                        .authorEmail(rs.getString("author_email"))
                        .authorName(rs.getString("author_name"))
                        .postsCreated(rs.getLong("posts_created"))
                        .commentsMade(rs.getLong("comments_made"))
                        .totalEngagement(rs.getLong("total_engagement"))
                        .build()
        , USER_ENGAGEMENT_LIMIT);
        return CompletableFuture.completedFuture(result);
    }

    @Async
    public CompletableFuture<List<AnalyticsDtos.CategoryTrend>> getCategoryTrendsAsync() {
        String sql = """
                SELECT category,
                       total_posts
                FROM analytics_category_trends
                ORDER BY total_posts DESC, category ASC
                """;

        List<AnalyticsDtos.CategoryTrend> result = jdbcTemplate.query(sql, (rs, rowNum) ->
                AnalyticsDtos.CategoryTrend.builder()
                        .category(rs.getString("category"))
                        .totalPosts(rs.getLong("total_posts"))
                        .build()
        );
        return CompletableFuture.completedFuture(result);
    }

    @Async
    public CompletableFuture<List<AnalyticsDtos.TopContributor>> getTopContributorsAsync() {
        String sql = """
                SELECT author_name,
                       author_email,
                       posts_created,
                       comments_made,
                       total_engagement
                FROM analytics_top_contributors
                ORDER BY total_engagement DESC
                LIMIT ?
                """;

        List<AnalyticsDtos.TopContributor> result = jdbcTemplate.query(sql, (rs, rowNum) ->
                AnalyticsDtos.TopContributor.builder()
                        .authorName(rs.getString("author_name"))
                        .authorEmail(rs.getString("author_email"))
                        .postsCreated(rs.getLong("posts_created"))
                        .commentsMade(rs.getLong("comments_made"))
                        .totalEngagement(rs.getLong("total_engagement"))
                        .build()
        , TOP_CONTRIBUTORS_LIMIT);
        return CompletableFuture.completedFuture(result);
    }

    @Async
    public CompletableFuture<List<AnalyticsDtos.ContentStat>> getContentStatsAsync() {
        LocalDate since = LocalDate.now().minusDays(CONTENT_STATS_DAYS);
        String sql = """
                SELECT date,
                       avg_title_len,
                       avg_content_len
                FROM analytics_content_stats
                WHERE date >= ?
                ORDER BY date DESC
                """;

        List<AnalyticsDtos.ContentStat> result = jdbcTemplate.query(sql, (rs, rowNum) ->
                AnalyticsDtos.ContentStat.builder()
                        .date(rs.getObject("date", LocalDate.class))
                        .avgTitleLen(rs.getDouble("avg_title_len"))
                        .avgContentLen(rs.getDouble("avg_content_len"))
                        .build()
        , since);
        return CompletableFuture.completedFuture(result);
    }

    @Async
    public CompletableFuture<List<AnalyticsDtos.PostsByDayOfWeek>> getPostsByDayOfWeekAsync() {
        String sql = """
                SELECT day_of_week, post_count
                FROM analytics_posts_day_of_week
                ORDER BY day_of_week ASC
                """;

        List<AnalyticsDtos.PostsByDayOfWeek> result = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Object dayOfWeek = rs.getObject("day_of_week");
            return AnalyticsDtos.PostsByDayOfWeek.builder()
                    .dayOfWeek(dayOfWeek)
                    .postCount(rs.getLong("post_count"))
                    .build();
        });
        return CompletableFuture.completedFuture(result);
    }
}

