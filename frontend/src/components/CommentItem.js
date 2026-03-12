import React from "react";
import Avatar from "./Avatar";
import { PenIcon, TrashIcon } from "./icons";

const CommentItem = ({
  comment,
  canModify,
  isEditing,
  editingContent,
  onEditingContentChange,
  onEditStart,
  onEditSave,
  onEditCancel,
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

        {/* Content or inline edit */}
        {isEditing ? (
          <div className="flex flex-col gap-[8px] w-full">
            <textarea
              value={editingContent}
              onChange={(e) => onEditingContentChange(e.target.value)}
              className="w-full h-[100px] px-[16px] py-[14px] bg-ping-input-bg border border-ping-input-border rounded-[8px] text-[14px] text-ping-body-primary focus:outline-none focus:ring-1 focus:ring-ping-dark resize-none font-inter leading-[1.5]"
            />
            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => onEditSave(comment.id)}
                disabled={!editingContent.trim()}
                className="text-[14px] font-medium font-inter text-white bg-ping-dark hover:opacity-90 transition-opacity px-[20px] py-[10px] rounded-[8px] disabled:opacity-50"
              >
                Save Changes
              </button>
              <button
                onClick={onEditCancel}
                className="text-[13px] font-medium font-inter text-ping-body hover:opacity-70 transition-opacity px-[14px] py-[6px] border border-ping-stroke rounded-[6px]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[16px] font-normal font-inter text-ping-body leading-[1.5] w-full break-words">
            {comment.content}
          </p>
        )}
      </div>

      {/* Edit / delete actions */}
      {canModify && !isEditing && (
        <div className="flex items-center gap-[32px] shrink-0 text-ping-placeholder">
          <button
            onClick={() => onEditStart(comment)}
            className="hover:opacity-70 transition-opacity flex items-center justify-center p-1"
            title="Edit"
          >
            <PenIcon />
          </button>
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
