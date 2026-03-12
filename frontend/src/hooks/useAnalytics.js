import { useState, useCallback, useEffect } from "react";
import { postAPI } from "../services/api";

const CATEGORY_ORDER = ["Events", "Help Requests", "Lost & Found", "Recommendations"];
const DAY_ORDER = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
const DAY_INDEX_MAP = { 0: "Sun", 1: "Mon", 2: "Tues", 3: "Wed", 4: "Thurs", 5: "Fri", 6: "Sat" };

export { CATEGORY_ORDER, DAY_ORDER };

export function useAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await postAPI.getAll(0, 500);
      const payload = res.data?.data || res.data;
      const posts = payload?.content || (Array.isArray(payload) ? payload : []);
      const totalPosts = payload?.totalElements ?? posts.length;
      const totalComments = posts.reduce((sum, p) => sum + (p.commentCount ?? 0), 0);

      const catCounts = {};
      CATEGORY_ORDER.forEach((c) => (catCounts[c] = 0));
      posts.forEach((p) => {
        if (p.categoryName) catCounts[p.categoryName] = (catCounts[p.categoryName] ?? 0) + 1;
      });

      const dayCounts = {};
      DAY_ORDER.forEach((d) => (dayCounts[d] = 0));
      posts.forEach((p) => {
        if (p.createdAt) {
          const dayLabel = DAY_INDEX_MAP[new Date(p.createdAt).getDay()];
          if (dayLabel) dayCounts[dayLabel] = (dayCounts[dayLabel] ?? 0) + 1;
        }
      });

      const authorCounts = {};
      posts.forEach((p) => {
        if (p.authorName) authorCounts[p.authorName] = (authorCounts[p.authorName] ?? 0) + 1;
      });
      const topContributors = Object.entries(authorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalPosts,
        totalComments,
        catBars: CATEGORY_ORDER.map((c) => catCounts[c]),
        dayBars: DAY_ORDER.map((d) => dayCounts[d]),
        topContributors,
      });
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { stats, loading };
}
