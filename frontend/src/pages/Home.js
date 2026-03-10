import React, { useEffect, useState } from "react";
import { postAPI } from "../services/api";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postAPI.getAll()
      .then((res) => setPosts(res.data.content || []))
      .catch((err) => console.error("Failed to load posts", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="ml-3 text-muted">Loading posts...</span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h1 className="mb-6 text-3xl font-bold">Recent Posts</h1>
      {posts.length === 0 ? (
        <p className="text-muted">No posts yet. Be the first to post!</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="mt-1 text-xs text-muted">
                by {post.authorName} &bull; {new Date(post.createdAt).toLocaleDateString()}
                {post.categoryName && (
                  <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    {post.categoryName}
                  </span>
                )}
              </p>
              <p className="mt-3 leading-relaxed text-ink/80">{post.content}</p>
              <p className="mt-3 text-xs font-medium text-primary">
                {post.commentCount} comments
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
