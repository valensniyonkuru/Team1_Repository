import React from "react";
import { Link } from "react-router-dom";
import { ClockIcon, CommentIcon } from "./icons";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLORS } from "../constants/categoryColors";

const PostCard = ({ id, title, body, category, author, time, commentCount }) => {
  const colors = CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLORS;

  return (
    <article className="bg-ping-bg border border-ping-stroke rounded-[14px] px-4 py-6 md:p-6 w-full font-inter">
      <div className="flex items-center justify-between gap-4">
        <h2
          data-testid="post-title"
          className="flex-1 text-xl font-semibold leading-[1.5] text-ping-heading hover:text-ping-dark transition-colors"
        >
          <Link to={`/posts/${id}`}>{title}</Link>
        </h2>
        {category && (
          <span
            data-testid="post-category"
            className={`shrink-0 inline-flex items-center justify-center px-3 py-0.5 rounded-md border text-sm font-medium leading-[1.5] uppercase ${colors.bg} ${colors.border} ${colors.text}`}
          >
            {category}
          </span>
        )}
      </div>

      <p
        data-testid="post-content"
        className="mt-3 text-base font-normal leading-[1.5] text-ping-body line-clamp-2"
      >
        {body}
      </p>

      <div className="mt-3 pt-2 border-t border-ping-stroke flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-ping-body">{author}</span>
          <div className="flex items-center gap-1">
            <ClockIcon />
            <span className="text-sm font-normal text-ping-placeholder">{time}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <CommentIcon />
          <span className="text-base font-semibold text-ping-body">{commentCount}</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
