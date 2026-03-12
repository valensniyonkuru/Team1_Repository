import React from "react";

const CommentForm = ({ value, onChange, onSubmit, submitting, error }) => (
  <form onSubmit={onSubmit} className="flex flex-col items-end gap-[11px] w-full">
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Share your thoughts..."
      className="w-full h-[218px] px-[16px] py-[12px] bg-ping-input-bg border border-ping-input-border rounded-[8px] text-[14px] text-ping-body-primary placeholder:text-ping-body focus:outline-none focus:ring-1 focus:ring-ping-dark resize-none font-inter leading-[1.5]"
    />
    {error && (
      <p className="w-full text-[13px] font-inter text-[#c81e1e]">{error}</p>
    )}
    <button
      type="submit"
      disabled={submitting || !value.trim()}
      className="w-full py-[12px] px-[20px] bg-ping-dark text-ping-bg rounded-[8px] text-[16px] font-medium font-inter leading-[1.5] hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {submitting ? "Adding..." : "Add comment"}
    </button>
  </form>
);

export default CommentForm;
