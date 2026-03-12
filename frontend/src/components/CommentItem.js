import React from "react";
import Avatar from "./Avatar";
import { TrashIcon } from "./icons";

const CommentItem = ({
  comment,
  canModify,
  deletingId,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  formatDate,
}) => (
  <React.Fragment>
    {/* Delete confirmation banner */}
    {deletingId === comment.id && (
      <div className="flex items-center justify-between gap-[16px] bg-[#fff1f1] border border-[#fca5a5] rounded-[8px] px-[16px] py-[12px]">
        <span className="text-[14px] font-inter text-[#991b1b]">
          Delete this comment? This cannot be undone.
        </span>
        <div className="flex items-center gap-[12px]">
          <button
            onClick={onDeleteCancel}
            className="text-[14px] font-medium font-inter text-ping-body hover:opacity-70 transition-opacity px-[12px] py-[6px] border border-ping-stroke rounded-[6px]"
          >
            Cancel
          </button>
          <button
            onClick={() => onDeleteConfirm(comment.id)}
            className="text-[14px] font-medium font-inter text-white bg-[#dc2626] hover:bg-[#b91c1c] transition-colors px-[12px] py-[6px] rounded-[6px]"
          >
            Delete
          </button>
        </div>
      </div>
    )}

    {/* Comment row */}
    <div className="flex items-start justify-between gap-[16px] w-full">
      <div className="flex flex-col gap-[16px] flex-1 max-w-full">
        {/* Author meta */}
        <div className="flex items-center gap-[12px]">
          <Avatar name={comment.authorName} size="lg" />
          <div className="flex flex-col gap-[6px]">
            <p className="text-[16px] font-semibold font-inter text-ping-body-primary leading-[16px]">
              {comment.authorName}
            </p>
            <p className="text-[14px] font-normal font-inter text-ping-body leading-[14px]">
              {formatDate(comment.createdAt, "relative")}
            </p>
          </div>
        </div>

        {/* Content */}
        <p className="text-[16px] font-normal font-inter text-ping-body leading-[1.5] w-full break-words">
          {comment.content}
        </p>
      </div>

      {/* Delete action */}
      {canModify && (
        <div className="flex items-center shrink-0 text-ping-placeholder">
          <button
            onClick={() => onDeleteRequest(comment.id)}
            className="hover:opacity-70 transition-opacity flex items-center justify-center p-1 text-[#dc2626]"
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  </React.Fragment>
);

export default CommentItem;
