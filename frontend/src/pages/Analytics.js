import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { postAPI } from "../services/api";

// --- Icons ---
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b2bcc2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#08283b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const MessageCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#08283b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
  </svg>
);

// --- Constants ---
const CATEGORY_ORDER = ["Events", "Help Requests", "Lost & Found", "Recommendations"];
const DAY_ORDER = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
// getDay() → 0=Sun,1=Mon,...,6=Sat
const DAY_INDEX_MAP = { 0: "Sun", 1: "Mon", 2: "Tues", 3: "Wed", 4: "Thurs", 5: "Fri", 6: "Sat" };

const BAR_AREA_HEIGHT = 180; // px — matches Figma's ~178px usable bar area

// --- Bar Chart ---
function BarChart({ bars, xLabels }) {
  const maxVal = Math.max(...bars, 1);
  const step = Math.max(Math.ceil(maxVal / 4), 1);
  const yMax = step * 4;
  const yTicks = [yMax, step * 3, step * 2, step, 0];

  return (
    <div className="flex gap-[16px] items-start w-full">
      {/* Y-axis labels */}
      <div
        className="flex flex-col justify-between shrink-0 w-5 text-right"
        style={{ height: `${BAR_AREA_HEIGHT}px` }}
      >
        {yTicks.map((t) => (
          <span key={t} className="text-[12px] font-inter text-ping-placeholder leading-none">
            {t}
          </span>
        ))}
      </div>

      {/* Chart + X labels */}
      <div className="flex-1 flex flex-col gap-[8px] min-w-0">
        {/* Bar area */}
        <div className="relative w-full" style={{ height: `${BAR_AREA_HEIGHT}px` }}>
          {/* Dashed grid lines (skip the 0 line) */}
          {yTicks.slice(0, -1).map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-dashed border-ping-stroke"
              style={{ bottom: `${Math.round((t / yMax) * BAR_AREA_HEIGHT)}px` }}
            />
          ))}
          {/* Bars */}
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-between gap-[8px]">
            {bars.map((val, i) => (
              <div
                key={i}
                className="bg-ping-body rounded-t-[2px] flex-1"
                style={{
                  height: `${Math.max(Math.round((val / yMax) * BAR_AREA_HEIGHT), val > 0 ? 2 : 0)}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between gap-[8px]">
          {xLabels.map((label, i) => (
            <span
              key={i}
              className="text-[12px] font-inter text-ping-placeholder text-center leading-[1.5] flex-1 min-w-0"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Analytics Page ---
const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await postAPI.getAll(0, 500);
      const payload = res.data?.data || res.data;
      const posts = payload?.content || (Array.isArray(payload) ? payload : []);
      const totalPosts = payload?.totalElements ?? posts.length;

      // Total comments from commentCount field on each post
      const totalComments = posts.reduce((sum, p) => sum + (p.commentCount ?? 0), 0);

      // Posts by category
      const catCounts = {};
      CATEGORY_ORDER.forEach((c) => (catCounts[c] = 0));
      posts.forEach((p) => {
        const cat = p.categoryName;
        if (cat) catCounts[cat] = (catCounts[cat] ?? 0) + 1;
      });

      // Posts by day of week
      const dayCounts = {};
      DAY_ORDER.forEach((d) => (dayCounts[d] = 0));
      posts.forEach((p) => {
        if (p.createdAt) {
          const dayLabel = DAY_INDEX_MAP[new Date(p.createdAt).getDay()];
          if (dayLabel) dayCounts[dayLabel] = (dayCounts[dayLabel] ?? 0) + 1;
        }
      });

      // Top 10 contributors by post count
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ping-dark" />
      </div>
    );
  }

  return (
    <div className="bg-ping-bg min-h-screen">
      <div className="max-w-[1440px] mx-auto px-[16px] md:px-[20px] lg:px-[120px] pt-[84px] pb-[120px] flex flex-col gap-[64px]">

        {/* Breadcrumb */}
        <div className="flex items-center gap-[16px] bg-ping-bg border border-ping-stroke py-[12px] px-[20px] rounded-[8px] w-fit">
          <Link to="/" className="text-ping-dark hover:opacity-70 transition-opacity flex items-center justify-center">
            <HomeIcon />
          </Link>
          <div className="flex items-center gap-[8px]">
            <Link to="/" className="text-[14px] font-medium font-inter text-ping-dark hover:underline">
              Home
            </Link>
            <ChevronRight />
            <span className="text-[14px] font-medium font-inter text-ping-dark">Analytics</span>
          </div>
        </div>

        <div className="flex flex-col gap-[32px] w-full">

          {/* Stat Cards */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-[32px]">
            <div className="bg-ping-bg border border-ping-stroke rounded-[14px] p-[24px] flex flex-col gap-[8px] w-full lg:flex-1 lg:max-w-[400px]">
              <div className="flex items-center justify-between h-[40px]">
                <span className="text-[18px] lg:text-[24px] font-medium font-inter text-ping-body leading-[1.5]">
                  Total Posts
                </span>
                <div className="bg-[#cde6fc] rounded-[10px] w-[40px] h-[40px] flex items-center justify-center shrink-0">
                  <TrendingUpIcon />
                </div>
              </div>
              <p className="text-[48px] font-bold font-poppins text-ping-body-primary leading-[1.5]">
                {stats?.totalPosts ?? 0}
              </p>
            </div>

            <div className="bg-ping-bg border border-ping-stroke rounded-[14px] p-[24px] flex flex-col gap-[8px] w-full lg:flex-1 lg:max-w-[400px]">
              <div className="flex items-center justify-between h-[40px]">
                <span className="text-[18px] lg:text-[24px] font-medium font-inter text-ping-body leading-[1.5]">
                  Total Comments
                </span>
                <div className="bg-[#cde6fc] rounded-[10px] w-[40px] h-[40px] flex items-center justify-center shrink-0">
                  <MessageCircleIcon />
                </div>
              </div>
              <p className="text-[48px] font-bold font-poppins text-ping-body-primary leading-[1.5]">
                {stats?.totalComments ?? 0}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[32px] w-full">
            <div className="bg-ping-bg border border-ping-stroke rounded-[8px] p-[16px] flex flex-col gap-[16px]">
              <div className="py-[8px]">
                <h2 className="text-[18px] lg:text-[24px] font-semibold font-poppins text-ping-body-primary leading-[1.5]">
                  Posts by Category
                </h2>
              </div>
              <BarChart bars={stats?.catBars ?? [0, 0, 0, 0]} xLabels={CATEGORY_ORDER} />
            </div>

            <div className="bg-ping-bg border border-ping-stroke rounded-[8px] p-[16px] flex flex-col gap-[16px]">
              <div className="py-[8px]">
                <h2 className="text-[18px] lg:text-[24px] font-semibold font-poppins text-ping-body-primary leading-[1.5]">
                  Posts Day of Week
                </h2>
              </div>
              <BarChart bars={stats?.dayBars ?? [0, 0, 0, 0, 0, 0, 0]} xLabels={DAY_ORDER} />
            </div>
          </div>

          {/* Top 10 Contributors */}
          <div className="flex flex-col gap-[16px] w-full">
            <h2 className="text-[20px] font-bold font-inter text-ping-body-primary leading-[1.5]">
              Top 10 Contributors
            </h2>
            <div className="w-full rounded-[8px] overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
              <table className="w-full border-collapse font-inter">
                <thead>
                  <tr className="bg-[#e6eaeb]">
                    <th className="text-left px-[8px] md:px-[16px] py-[12px] md:py-[16px] text-[14px] md:text-[16px] font-medium font-poppins text-ping-body leading-[1.5] border-b border-ping-stroke w-[56px] md:w-[80px] h-[56px]">
                      Ranks
                    </th>
                    <th className="text-left px-[8px] md:px-[16px] py-[12px] md:py-[16px] text-[14px] md:text-[16px] font-medium font-poppins text-ping-body leading-[1.5] border-b border-ping-stroke h-[56px]">
                      Name
                    </th>
                    <th className="text-left px-[8px] md:px-[16px] py-[12px] md:py-[16px] text-[14px] md:text-[16px] font-medium font-poppins text-ping-body leading-[1.5] border-b border-ping-stroke w-[60px] md:w-[120px] h-[56px]">
                      Posts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.topContributors?.length > 0 ? (
                    stats.topContributors.map((contributor, index) => (
                      <tr
                        key={contributor.name}
                        className="bg-ping-bg border-b border-ping-stroke last:border-b-0 h-[64px]"
                      >
                        <td className="px-[8px] md:px-[16px] py-[12px] md:py-[16px] text-[14px] md:text-[16px] font-normal text-ping-body-primary leading-[1.5]">
                          {index + 1}
                        </td>
                        <td className="px-[8px] md:px-[16px] py-[12px] md:py-[16px] text-[14px] md:text-[16px] font-normal text-ping-body-primary leading-[1.5]">
                          {contributor.name}
                        </td>
                        <td className="px-[8px] md:px-[16px] py-[12px] md:py-[16px] text-[14px] md:text-[16px] font-normal text-ping-body-primary leading-[1.5]">
                          {contributor.count}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-[16px] py-[32px] text-center text-ping-placeholder text-[14px]">
                        No data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
