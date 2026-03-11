import React, { useEffect, useState, useCallback } from "react";
import { postAPI } from "../services/api";
import CreatePostModal from "../components/CreatePostModal";

const SearchIcon = ({ color = "#395362", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#395362"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fdfdfd"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5v14" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#5a6f7c"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CommentIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#395362"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
  </svg>
);

/* ─── Category Badge Color Map ────────────────────────────── */

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
    bg: "bg-ping-badge-yellow-bg",
    border: "border-ping-badge-yellow-border",
    text: "text-ping-badge-yellow-text",
  },
};

const getDefaultColors = () => ({
  bg: "bg-gray-100",
  border: "border-gray-300",
  text: "text-gray-600",
});

/* ─── Helper: Relative Time ──────────────────────────────── */

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `about ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `about ${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

/* ─── Post Card Component ────────────────────────────────── */

const PostCard = ({ title, body, category, author, time, commentCount }) => {
  const colors = CATEGORY_COLORS[category] || getDefaultColors();

  return (
    <article className="bg-ping-bg border border-ping-stroke rounded-[14px] px-4 py-6 md:p-6 w-full font-inter">
      {/* Header: Title + Badge */}
      <div className="flex items-center justify-between gap-4">
        <h2 
          data-testid="post-title"
          className="flex-1 text-xl font-semibold leading-[1.5] text-ping-heading"
        >
          {title}
        </h2>
        {category && (
          <span
            data-testid="post-category"
            className={`shrink-0 inline-flex items-center justify-center px-3 py-0.5 rounded-md border text-sm font-medium leading-[1.5] ${colors.bg} ${colors.border} ${colors.text}`}
          >
            {category}
          </span>
        )}
      </div>

      {/* Body */}
      <p 
        data-testid="post-content"
        className="mt-3 text-base font-normal leading-[1.5] text-ping-body line-clamp-2"
      >
        {body}
      </p>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-ping-stroke flex items-center justify-between">
        {/* Left: Author + Time */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-ping-body">{author}</span>
          <div className="flex items-center gap-1">
            <ClockIcon />
            <span className="text-sm font-normal text-ping-placeholder">
              {time}
            </span>
          </div>
        </div>

        {/* Right: Comments */}
        <div className="flex items-center gap-1.5">
          <CommentIcon />
          <span className="text-base font-semibold text-ping-body">
            {commentCount}
          </span>
        </div>
      </div>
    </article>
  );
};

/* ─── Pagination Component ───────────────────────────────── */

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center self-end border border-ping-stroke rounded overflow-hidden font-inter">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm font-medium text-ping-body-primary bg-ping-bg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1.5 text-sm font-medium border-l border-ping-stroke transition-colors ${
            currentPage === page
              ? "bg-ping-dark text-ping-bg"
              : "bg-ping-bg text-ping-body-primary hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm font-medium text-ping-body-primary bg-ping-bg border-l border-ping-stroke hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

/* ─── Home Page ──────────────────────────────────────────── */

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    "All",
    "Events",
    "Lost & Found",
    "Recommendations",
    "Help Requests",
  ];

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

  const filteredPosts = posts.filter(
    (p) =>
      (activeCategory === "All" || p.categoryName === activeCategory) &&
      p.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        {/* ── Search Bar + Create Post ──────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
          {/* Search */}
          <div className="flex items-center w-full md:max-w-[691px] gap-3">
            <div className="bg-ping-input-bg border border-ping-input-border rounded-lg px-4 py-3 flex-1 flex items-center gap-2.5">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search by title of post..."
                className="bg-transparent border-none outline-none flex-1 font-normal text-sm text-ping-body placeholder:text-ping-body leading-[1.25]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="focus:outline-none flex items-center justify-center"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
            <button className="bg-ping-dark rounded-lg px-3 py-2.5 flex items-center justify-center flex-shrink-0 transition-colors hover:bg-opacity-90">
              <SearchIcon color="#FDFDFD" size={20} />
            </button>
          </div>

          {/* Create post button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-ping-dark rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 flex-shrink-0 transition-colors hover:bg-opacity-90 group"
          >
            <PlusIcon />
            <span className="font-medium text-sm text-ping-bg leading-[1.5]">
              Create post
            </span>
          </button>
        </div>

        {/* ── Category Filters ─────────────────────────── */}
        <div className="flex items-start md:items-center gap-4 flex-col md:flex-row w-full">
          <span className="hidden md:inline-block font-normal text-base text-ping-body-primary leading-[1.5]">
            Categories:
          </span>
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center justify-center px-3 py-0.5 rounded-md border border-ping-badge-stroke text-sm font-medium leading-[1.5] transition-colors ${
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

        {/* ── Posts + Pagination ────────────────────────── */}
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full mt-10 gap-6">
            <img
              src="/assets/messages-empty.svg"
              alt="No posts yet"
              className="w-[280px] h-[280px] object-contain"
            />
            <p className="font-normal text-base text-ping-placeholder">
              No posts have been made yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 items-end w-full">
            <div className="flex flex-col gap-6 w-full">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  title={post.title}
                  body={post.content}
                  category={post.categoryName}
                  author={post.authorName}
                  time={timeAgo(post.createdAt)}
                  commentCount={post.commentCount ?? 0}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        )}
      </div>
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={fetchPosts}
      />
    </div>
  );
};

export default Home;
