import React from "react";

const SIZE = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-[5px]",
};

/**
 * Spinner — bare animated ring.
 * Use inside any existing layout.
 */
export const Spinner = ({ size = "md" }) => (
  <div
    className={`${SIZE[size]} animate-spin rounded-full border-ping-dark border-t-transparent`}
    aria-live="polite"
    aria-label="Loading"
  />
);

/**
 * PageLoader — centred full-width container with a Spinner inside.
 * Drop this in as a page-level loading replacement.
 *
 * @param {string} className  - extra classes applied to the wrapper (e.g. "mt-8 min-h-[50vh]")
 * @param {"sm"|"md"|"lg"} size - spinner size (default "md")
 */
const PageLoader = ({ className = "min-h-[400px]", size = "md" }) => (
  <div className={`flex items-center justify-center w-full ${className}`}>
    <Spinner size={size} />
  </div>
);

export default PageLoader;
