import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { postAPI, commentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

// --- Icons ---
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b2bcc2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
);

const PenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 9 2 2 4-4" />
  </svg>
);

const CATEGORY_COLORS = {
  Events: {
    bg: "bg-ping-badge-purple-bg",
    border: "border-ping-badge-purple-border",
    text: "text-ping-badge-purple-text",
  },
  "Lost & Found": {
    bg: "bg-ping-badge-red-bg",
    border: "border-ping-badge-red-border",
    text: "text-ping-badge-red-text",
  },
  Recommendations: {
    bg: "bg-ping-badge-green-bg",
    border: "border-ping-badge-green-border",
    text: "text-ping-badge-green-text",
  },
  "Help Requests": {
    bg: "bg-[#e1effe]",
    border: "border-[#a4cafe]",
    text: "text-[#1e429f]",
  },
};

const Avatar = ({ name, size = "md" }) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
  
  const sizeClass = size === "lg" ? "w-[48px] h-[48px] text-[16px]" : "w-[32px] h-[32px] text-xs";
  
  return (
    <div className={`${sizeClass} flex items-center justify-center bg-[#c3c3c2] text-[#222220] font-medium rounded-full shrink-0 font-inter`}>
      {initials}
    </div>
  );
};

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [commentError, setCommentError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        postAPI.getById(id),
        commentAPI.getByPostId(id)
      ]);
      const postData = postRes.data?.data || postRes.data;
      const commentsData = commentsRes.data?.data || commentsRes.data;
      
      setPost(postData);
      setComments(commentsData?.content || (Array.isArray(commentsData) ? commentsData : []));
    } catch (err) {
      console.error("Error fetching post details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      setSubmitting(true);
      setCommentError("");
      await commentAPI.create(id, { content: commentContent });
      setCommentContent("");
      const res = await commentAPI.getByPostId(id);
      const commentsData = res.data?.data || res.data;
      setComments(commentsData?.content || (Array.isArray(commentsData) ? commentsData : []));
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add comment. Please try again.";
      setCommentError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleEditSave = async (commentId) => {
    if (!editingContent.trim()) return;
    try {
      await commentAPI.update(id, commentId, { content: editingContent });
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, content: editingContent.trim() } : c)
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const handleDeleteConfirm = async (commentId) => {
    try {
      await commentAPI.delete(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const canModifyComment = (comment) =>
    user && (user.name === comment.authorName || user.role === "ADMIN");

  const formatDate = (dateString, format = "relative") => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (format === "exact") return date.toLocaleDateString();

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins Ago`;
    if (diffInSeconds < 86400) return `About ${Math.floor(diffInSeconds / 3600)} hr Ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ping-dark"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-12 text-center text-ping-body">
        Post not found.
      </div>
    );
  }

  const categoryStyles = CATEGORY_COLORS[post.category?.name] || CATEGORY_COLORS["Events"];

  return (
    <div className="bg-ping-bg min-h-screen">
      <div className="max-w-[1200px] mx-auto px-[16px] md:px-[20px] lg:px-[120px] pt-[84px] pb-[120px] flex flex-col gap-[48px]">
        
        {/* Breadcrumb - Matches 7:3435 */}
        <div className="flex items-center gap-[16px] bg-ping-bg border border-ping-stroke py-[12px] px-[20px] rounded-[8px] w-fit">
          <Link to="/" className="text-ping-dark hover:opacity-70 transition-opacity flex items-center justify-center">
            <HomeIcon />
          </Link>
          <div className="flex items-center gap-[8px]">
            <Link to="/" className="text-[14px] font-medium font-inter text-ping-dark hover:underline">Home</Link>
            <ChevronRight />
            <span className="text-[14px] font-medium font-inter text-ping-dark">Post Details</span>
          </div>
        </div>

        {/* Post Content & Comments Container - Matches 16:1056 */}
        <div className="flex flex-col gap-[40px] w-full">
          
          {/* Post Header & Body - Matches 7:3505 */}
          <div className="flex flex-col gap-[16px] w-full">
            <div className="flex flex-col md:flex-row gap-[46px] md:items-center w-full">
              <h1 className="text-[32px] font-semibold font-poppins text-ping-heading leading-[1.5] flex-1">
                {post.title}
              </h1>
              <div className={`shrink-0 px-[12px] py-[2px] border border-solid rounded-[6px] text-[14px] font-medium font-inter ${categoryStyles.bg} ${categoryStyles.border} ${categoryStyles.text} whitespace-nowrap`}>
                {post.category?.name}
              </div>
            </div>

            <p className="text-[16px] font-normal font-inter text-ping-body leading-[1.5] w-full">
              {post.content}
            </p>

            {/* Post Author Info - Matches 7:3493 */}
            <div className="flex items-center gap-[16px] h-[20px]">
              <span className="text-[14px] font-medium font-inter text-ping-body">{post.authorName}</span>
              <div className="flex items-center gap-[4px] text-ping-placeholder">
                <ClockIcon />
                <span className="text-[14px] font-normal font-inter leading-[1.5] whitespace-nowrap">
                  about {Math.floor((new Date() - new Date(post.createdAt)) / 3600000)} hours ago
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-ping-stroke mt-4" />
          </div>

          {/* Comments Section Container - Matches 16:1055 */}
          <div className="flex flex-col gap-[20px] w-full">
            {/* Comment Form - Matches 16:991 */}
            <form onSubmit={handleAddComment} className="flex flex-col items-end gap-[11px] w-full">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full h-[218px] px-[16px] py-[12px] bg-ping-input-bg border border-ping-input-border rounded-[8px] text-[14px] text-ping-body-primary placeholder:text-ping-body focus:outline-none focus:ring-1 focus:ring-ping-dark resize-none font-inter leading-[1.5]"
              />
              {commentError && (
                <p className="w-full text-[13px] font-inter text-[#c81e1e]">{commentError}</p>
              )}
              <button 
                type="submit"
                disabled={submitting || !commentContent.trim()}
                className="w-full md:w-[345px] py-[10px] px-[20px] bg-ping-dark text-ping-bg rounded-[8px] text-[14px] font-medium font-inter leading-[1.5] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add comment"}
              </button>
            </form>

            {/* Comments List Section - Matches 16:1053 */}
            <div className="flex flex-col gap-[40px] w-full">
              <div className="flex items-center gap-[6px] text-[24px] font-bold text-ping-body tracking-[-0.24px] font-inter leading-[1.5]">
                <span>Comments</span>
                <span>({comments.length})</span>
              </div>

              {comments.length === 0 ? (
                <div className="py-12 text-center text-ping-placeholder font-inter">
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                <div className="flex flex-col gap-[24px] w-full">
                  {comments.map((comment, index) => (
                    <React.Fragment key={comment.id}>
                      {/* Delete Confirmation Inline Banner */}
                      {deletingCommentId === comment.id && (
                        <div className="flex items-center justify-between gap-[16px] bg-[#fff1f1] border border-[#fca5a5] rounded-[8px] px-[16px] py-[12px]">
                          <span className="text-[14px] font-inter text-[#991b1b]">Delete this comment? This cannot be undone.</span>
                          <div className="flex items-center gap-[12px]">
                            <button
                              onClick={() => setDeletingCommentId(null)}
                              className="text-[14px] font-medium font-inter text-ping-body hover:opacity-70 transition-opacity px-[12px] py-[6px] border border-ping-stroke rounded-[6px]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(comment.id)}
                              className="text-[14px] font-medium font-inter text-white bg-[#dc2626] hover:bg-[#b91c1c] transition-colors px-[12px] py-[6px] rounded-[6px]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Comment Item - Matches 16:1021 */}
                      <div className="flex items-start justify-between gap-[16px] w-full">
                        <div className="flex flex-col gap-[16px] flex-1 max-w-full">
                          {/* Comment Avatar & Meta - Matches 16:1008 */}
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

                          {/* Comment content or inline edit form */}
                          {editingCommentId === comment.id ? (
                            <div className="flex flex-col gap-[8px] w-full">
                              <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="w-full h-[100px] px-[16px] py-[12px] bg-ping-input-bg border border-ping-input-border rounded-[8px] text-[14px] text-ping-body-primary focus:outline-none focus:ring-1 focus:ring-ping-dark resize-none font-inter leading-[1.5]"
                              />
                              <div className="flex items-center gap-[8px]">
                                <button
                                  onClick={() => handleEditSave(comment.id)}
                                  disabled={!editingContent.trim()}
                                  className="text-[13px] font-medium font-inter text-white bg-ping-dark hover:opacity-90 transition-opacity px-[14px] py-[6px] rounded-[6px] disabled:opacity-50"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
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

                        {/* Action Icons - only visible to author or admin */}
                        {canModifyComment(comment) && editingCommentId !== comment.id && (
                          <div className="flex items-center gap-[32px] shrink-0 text-ping-placeholder">
                            <button
                              onClick={() => handleEditStart(comment)}
                              className="hover:opacity-70 transition-opacity flex items-center justify-center p-1"
                              title="Edit"
                            >
                              <PenIcon />
                            </button>
                            <button
                              onClick={() => setDeletingCommentId(comment.id)}
                              className="hover:opacity-70 transition-opacity flex items-center justify-center p-1 text-[#dc2626]"
                              title="Delete"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Divider - Matches 16:1019 */}
                      {index < comments.length - 1 && <div className="w-full h-px bg-ping-stroke" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;

