import { useState, useCallback, useEffect } from "react";
import { postAPI, commentAPI } from "../services/api";
import { useToast } from "../context/ToastContext";

export function usePostDetails(id) {
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [commentError, setCommentError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        postAPI.getById(id),
        commentAPI.getByPostId(id),
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
      const data = res.data?.data || res.data;
      setComments(data?.content || (Array.isArray(data) ? data : []));
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add comment. Please try again.";
      setCommentError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
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

  return {
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
  };
}
