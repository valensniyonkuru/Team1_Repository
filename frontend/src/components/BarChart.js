import React from "react";

const BAR_AREA_HEIGHT = 180;

const BarChart = ({ bars, xLabels }) => {
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

      {/* Chart area + X labels */}
      <div className="flex-1 flex flex-col gap-[8px] min-w-0">
        <div className="relative w-full" style={{ height: `${BAR_AREA_HEIGHT}px` }}>
          {/* Dashed grid lines */}
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
};

export default BarChart;
