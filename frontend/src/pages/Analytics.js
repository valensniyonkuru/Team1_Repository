import React from "react";
import { useAnalytics, DAY_ORDER } from "../hooks/useAnalytics";
import BarChart from "../components/BarChart";
import PageLoader from "../components/Spinner";
import Breadcrumb from "../components/Breadcrumb";
import { TrendingUpIcon, MessageCircleIcon } from "../components/icons";

const Analytics = () => {
  const { stats, loading } = useAnalytics();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="bg-ping-bg min-h-screen">
      <div className="max-w-[1440px] mx-auto px-[16px] md:px-[20px] lg:px-[120px] pt-[84px] pb-[120px] flex flex-col gap-[64px]">

        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Analytics" }]} />

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
              <BarChart bars={stats?.catBars ?? []} xLabels={stats?.categoryLabels ?? []} />
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
