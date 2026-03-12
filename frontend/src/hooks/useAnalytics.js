import { useState, useCallback, useEffect } from "react";
import { analyticsAPI } from "../services/api";

const DAY_ORDER = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
const DAY_INDEX_MAP = { 0: "Sun", 1: "Mon", 2: "Tues", 3: "Wed", 4: "Thurs", 5: "Fri", 6: "Sat" };

export { DAY_ORDER };

export function useAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await analyticsAPI.getOverview();
      const overview = res.data?.data || res.data;

      const categoryTrends = overview?.categoryTrends ?? [];
      const dailyActivity = overview?.dailyActivity ?? [];
      const topContributors = overview?.topContributors ?? [];
      const userEngagement = overview?.userEngagement ?? [];

      // Total posts = sum of all category post counts
      const totalPosts = categoryTrends.reduce((sum, c) => sum + (c.totalPosts ?? 0), 0);

      // Total comments = sum of each user's commentsMade
      const totalComments = userEngagement.reduce((sum, u) => sum + (u.commentsMade ?? 0), 0);

      // Category chart — sorted alphabetically for consistent axis order
      const categoryLabels = [...categoryTrends]
        .sort((a, b) => a.category.localeCompare(b.category))
        .map((c) => c.category);
      const catCountMap = Object.fromEntries(categoryTrends.map((c) => [c.category, c.totalPosts]));
      const catBars = categoryLabels.map((label) => catCountMap[label] ?? 0);

      // Day-of-week chart — aggregate postCount across all categories
      const dayCounts = Object.fromEntries(DAY_ORDER.map((d) => [d, 0]));
      dailyActivity.forEach((item) => {
        if (item.date) {
          const dayLabel = DAY_INDEX_MAP[new Date(item.date).getDay()];
          if (dayLabel) dayCounts[dayLabel] += item.postCount ?? 0;
        }
      });
      const dayBars = DAY_ORDER.map((d) => dayCounts[d]);

      // Top contributors — use postsCreated as the displayed count
      const mappedContributors = topContributors
        .slice(0, 10)
        .map((c) => ({ name: c.authorName, count: c.postsCreated ?? 0 }));

      setStats({ totalPosts, totalComments, categoryLabels, catBars, dayBars, topContributors: mappedContributors });
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { stats, loading, error };
}
