import React from "react";

const VARIANTS = {
  success: {
    bg: "bg-ping-badge-green-bg",
    iconBg: "bg-[#046c4e]",
    textColor: "text-[#046c4e]",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M13.5 4.5L6.5 11.5L3 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  error: {
    bg: "bg-ping-error-bg",
    iconBg: "bg-ping-error-text",
    textColor: "text-ping-error-text",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M4 4L12 12M12 4L4 12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  warning: {
    bg: "bg-ping-badge-yellow-bg",
    iconBg: "bg-ping-badge-yellow-text",
    textColor: "text-ping-badge-yellow-text",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M8 5V9M8 11.5V12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  info: {
    bg: "bg-[#e1effe]",
    iconBg: "bg-[#1a56db]",
    textColor: "text-[#1a56db]",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M8 7V12M8 4.5V5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
};

const Toast = ({ message, type = "success", onClose }) => {
  const variant = VARIANTS[type] ?? VARIANTS.success;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-center gap-[10px] ${variant.bg} p-[16px] rounded-[6px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] min-w-[280px] max-w-[400px] w-full`}
    >
      <div className={`${variant.iconBg} rounded-[8px] p-[8px] flex-shrink-0 flex items-center justify-center`}>
        {variant.icon}
      </div>
      <span
        className={`flex-1 font-inter font-normal text-[14px] leading-[1.5] ${variant.textColor}`}
      >
        {message}
      </span>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${variant.textColor} cursor-pointer`}
        aria-label="Dismiss notification"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M5 5L15 15M15 5L5 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
