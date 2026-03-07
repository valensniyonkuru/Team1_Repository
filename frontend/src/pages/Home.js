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

  if (loading) return <p id="home-loading" style={{ marginTop: 30 }}>Loading posts...</p>;

  return (
    <div id="home-page" style={{ marginTop: 30 }}>
      <h1 id="home-heading">Recent Posts</h1>
      {posts.length === 0 ? (
        <p id="home-empty">No posts yet. Be the first to post!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} id={`post-card-${post.id}`} className="card">
            <h2 id={`post-title-${post.id}`}>{post.title}</h2>
            <p style={{ color: "#636e72", fontSize: 13 }}>
              by {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}
              {post.categoryName && ` • ${post.categoryName}`}
            </p>
            <p style={{ marginTop: 10 }}>{post.content}</p>
            <p id={`post-comments-${post.id}`} style={{ marginTop: 8, color: "#0984e3", fontSize: 13 }}>
              {post.commentCount} comments
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default Home;
