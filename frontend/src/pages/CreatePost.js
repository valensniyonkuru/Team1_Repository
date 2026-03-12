import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI, categoryAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  if (!user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postAPI.create({ title, content, categoryId: categoryId || null });
      navigate("/");
    } catch (err) {
      setError("Failed to create post");
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-2xl px-6">
      <div className="rounded-lg bg-white p-8 shadow-sm border border-ping-stroke">
        <h1 className="mb-6 text-2xl font-bold">Create New Post</h1>
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            data-testid="post-title-input"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={categoryId}
            data-testid="post-category-select"
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Category (optional)</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea
            rows={8}
            data-testid="post-content-input"
            placeholder="Write your post content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full resize-y rounded-md border border-gray-300 px-4 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            data-testid="post-submit-button"
            className="w-full rounded-md bg-primary py-2.5 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Publish Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
