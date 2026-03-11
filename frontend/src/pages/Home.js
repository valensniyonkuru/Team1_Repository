import React, { useEffect, useState } from "react";
import { postAPI } from "../services/api";
import { Link } from "react-router-dom";

const SearchIcon = ({ color = "#395362" }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 19L14.65 14.65M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 1L1 19M1 1L19 19" stroke="#395362" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1V19M1 10H19" stroke="#FDFDFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Events", "Lost & Found", "Recommendations", "Help Requests"];

  useEffect(() => {
    postAPI.getAll()
      .then((res) => setPosts(res.data.content || []))
      .catch((err) => console.error("Failed to load posts", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ping-dark border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full pt-12 pb-16 font-inter">
      <div className="flex flex-col gap-8 w-full max-w-[1201px] px-6 xl:px-0">
        
        {/* Header: Search and Create Post */}
        <div className="flex flex-wrap items-center justify-between w-full gap-4">
          {/* Search */}
          <div className="flex items-center w-full max-w-[691px] gap-3">
            <div className="bg-ping-input-bg border border-ping-input-border rounded-lg px-4 py-3 flex-1 flex items-center gap-2.5">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search by title of post..."
                className="bg-transparent border-none outline-none flex-1 font-normal text-sm text-ping-body placeholder:text-ping-body"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="focus:outline-none flex items-center justify-center">
                  <CloseIcon />
                </button>
              )}
            </div>
            <button className="bg-ping-dark rounded-lg px-3 py-3 flex items-center justify-center flex-shrink-0 transition-colors hover:bg-opacity-90">
              <SearchIcon color="#FDFDFD" />
            </button>
          </div>
          
          {/* Create post button */}
          <Link to="/create-post" className="bg-ping-dark rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 flex-shrink-0 transition-colors hover:bg-opacity-90 group">
            <PlusIcon />
            <span className="font-medium text-sm text-ping-bg">Create post</span>
          </Link>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-normal text-base text-ping-body-primary">Categories:</span>
          <div className="flex items-center gap-2.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center justify-center px-3 py-0.5 rounded-md border border-ping-badge-stroke text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? "bg-ping-badge-bg text-ping-dark"
                    : "bg-ping-bg text-ping-dark hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts or Empty State */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full mt-10 gap-6">
            <img src="/assets/messages-empty.svg" alt="No posts yet" className="w-[280px] h-[280px] object-contain" />
            <p className="font-normal text-base text-ping-placeholder">
              No posts have been made yet
            </p>
          </div>
        ) : (
          <div className="grid gap-6 w-full">
            {posts.filter(p => 
              (activeCategory === "All" || p.categoryName === activeCategory) && 
              (p.title.toLowerCase().includes(searchTerm.toLowerCase()))
            ).map((post) => (
              <article
                key={post.id}
                className="rounded-lg bg-white p-6 shadow-sm border border-ping-stroke"
              >
                <h2 className="text-xl font-semibold text-ping-heading">{post.title}</h2>
                <p className="mt-1 text-sm text-ping-body">
                  by {post.authorName} &bull; {new Date(post.createdAt).toLocaleDateString()}
                  {post.categoryName && (
                    <span className="ml-2 inline-block rounded-md bg-ping-badge-bg/30 border border-ping-badge-stroke px-2 py-0.5 text-xs text-ping-dark">
                      {post.categoryName}
                    </span>
                  )}
                </p>
                <p className="mt-3 leading-relaxed text-ping-body">{post.content}</p>
                <p className="mt-3 text-xs font-medium text-ping-dark">
                  {post.commentCount} comments
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
