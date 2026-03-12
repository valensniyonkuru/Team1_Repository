import { useState, useCallback, useEffect } from "react";
import { postAPI } from "../services/api";

export function usePosts(currentPage) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    postAPI
      .getAll(currentPage - 1, 10)
      .then((res) => {
        const payload = res.data.data || res.data;
        setPosts(payload.content || []);
        setTotalPages(payload.totalPages || 1);
      })
      .catch((err) => console.error("Failed to load posts", err))
      .finally(() => setLoading(false));
  }, [currentPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, totalPages, fetchPosts };
}
