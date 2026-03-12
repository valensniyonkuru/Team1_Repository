import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePostDetails } from "../hooks/usePostDetails";
import { getCategoryColors } from "../constants/categoryColors";
import { timeAgo } from "../utils/formatDate";
import Breadcrumb from "../components/Breadcrumb";
import CommentForm from "../components/CommentForm";
import CommentItem from "../components/CommentItem";
import SwipeToDelete from "../components/SwipeToDelete";
import { ClockIcon } from "../components/icons";
import PageLoader from "../components/Spinner";

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

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const {
    post,
    comments,
    loading,
    commentContent,
    setCommentContent,
    submitting,
    deletingCommentId,
    setDeletingCommentId,
    commentError,
    handleAddComment,
    handleDeleteConfirm,
    handleDeletePost,
  } = usePostDetails(id);

  const canModifyPost = user && (user.name === post?.authorName || user.role === "ADMIN");

  const canModifyComment = (comment) =>
    user && (user.name === comment.authorName || user.role === "ADMIN");

  if (loading) {
    return <PageLoader />;
  }

  if (!post) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-12 text-center text-ping-body">
        Post not found.
      </div>
    );
  }

  const categoryStyles = getCategoryColors(post.categoryName);

  return (
    <div className="bg-ping-bg min-h-screen">
      <div className="max-w-[1200px] mx-auto px-[16px] md:px-[20px] lg:px-[120px] pt-[84px] pb-[120px] flex flex-col gap-[48px]">

        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Post Details" }]} />

        <div className="flex flex-col gap-[40px] w-full">

          {/* Post Header & Body */}
          <SwipeToDelete onDelete={handleDeletePost} disabled={!canModifyPost} label="Delete Post">
          <div className="flex flex-col gap-[16px] w-full">
            <div className="flex flex-row items-start gap-[46px] w-full">
              <h1 className="text-[32px] font-semibold font-poppins text-ping-heading leading-[1.5] flex-1 min-w-0">
                {post.title}
              </h1>
              <div className={`shrink-0 px-[12px] py-[2px] border border-solid rounded-[6px] text-[14px] font-medium font-inter ${categoryStyles.bg} ${categoryStyles.border} ${categoryStyles.text} whitespace-nowrap`}>
                {post.categoryName}
              </div>
            </div>
            <p className="text-[16px] font-normal font-inter text-ping-body leading-[1.5] w-full">
              {post.content}
            </p>
            <div className="flex items-center gap-[16px] h-[20px]">
              <span className="text-[14px] font-medium font-inter text-ping-body">{post.authorName}</span>
              <div className="flex items-center gap-[4px] text-ping-placeholder">
                <ClockIcon />
                <span className="text-[14px] font-normal font-inter leading-[1.5] whitespace-nowrap">
                  {timeAgo(post.createdAt)}
                </span>
              </div>
            </div>
            <div className="w-full h-px bg-ping-stroke mt-4" />
          </div>
          </SwipeToDelete>

          {/* Comments Section */}
          <div className="flex flex-col gap-[20px] w-full">
            <CommentForm
              value={commentContent}
              onChange={setCommentContent}
              onSubmit={handleAddComment}
              submitting={submitting}
              error={commentError}
            />

            <div className="flex flex-col gap-[40px] w-full">
              <div className="flex items-center gap-[6px] text-[24px] font-bold text-ping-body tracking-[-0.24px] font-inter leading-[1.5]">
                <span>Comments</span>
                <span>({comments.length})</span>
              </div>

              {comments.length === 0 ? (
                <div className="flex flex-col gap-[8px] items-center justify-center w-full">
                  <img src="/assets/Messages 03.svg" alt="" className="w-[200px] h-[200px]" aria-hidden="true" />
                  <p className="text-[16px] font-normal font-inter text-ping-placeholder text-center leading-[1.5]">
                    No Comments yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-[24px] w-full">
                  {comments.map((comment, index) => (
                    <React.Fragment key={comment.id}>
                      <CommentItem
                          comment={comment}
                          canModify={canModifyComment(comment)}
                          deletingId={deletingCommentId}
                          onDeleteRequest={setDeletingCommentId}
                          onDeleteConfirm={handleDeleteConfirm}
                          onDeleteCancel={() => setDeletingCommentId(null)}
                          formatDate={formatDate}
                        />
                      {index < comments.length - 1 && (
                        <div className="w-full h-px bg-ping-stroke" />
                      )}
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

