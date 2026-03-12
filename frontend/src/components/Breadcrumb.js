import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ChevronRight } from "./icons";

/**
 * Reusable breadcrumb strip.
 * Props:
 *   items: Array<{ label: string, to?: string }>
 *     - First item gets the home icon automatically
 *     - Items without `to` render as plain text (current page)
 */
const Breadcrumb = ({ items }) => (
  <div className="flex items-center gap-[16px] bg-ping-bg border border-ping-stroke py-[12px] px-[20px] rounded-[8px] w-fit">
    <Link
      to="/"
      className="text-ping-dark hover:opacity-70 transition-opacity flex items-center justify-center shrink-0"
    >
      <HomeIcon />
    </Link>
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {item.to ? (
          <Link
            to={item.to}
            className="text-[14px] font-medium font-inter text-ping-dark hover:underline whitespace-nowrap"
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-[14px] font-medium font-inter text-ping-dark whitespace-nowrap">
            {item.label}
          </span>
        )}
        {i < items.length - 1 && <ChevronRight />}
      </React.Fragment>
    ))}
  </div>
);

export default Breadcrumb;
