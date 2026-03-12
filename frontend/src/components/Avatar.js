import React from "react";
import { getInitials } from "../utils/formatDate";

const Avatar = ({ name, size = "md" }) => {
  const sizeClass =
    size === "lg" ? "w-[48px] h-[48px] text-[16px]" : "w-[32px] h-[32px] text-xs";

  return (
    <div
      className={`${sizeClass} flex items-center justify-center bg-[#c3c3c2] text-[#222220] font-medium rounded-full shrink-0 font-inter`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
