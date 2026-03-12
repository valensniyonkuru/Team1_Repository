import React, { useEffect, useState, useCallback } from "react";
import { postAPI, categoryAPI } from "../services/api";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import { timeAgo } from "../utils/formatDate";
import { SearchIcon, CloseIcon, PlusIcon } from "../components/icons";
import PageLoader from "../components/Spinner";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    categoryAPI
      .getAll()
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const names = (Array.isArray(data) ? data : []).map((c) => c.name);
        setCategories(["All", ...names]);
      })
      .catch(() => {});
  }, []);

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
    return <PageLoader className="mt-8 min-h-[50vh]" />;
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
                className={`flex items-center justify-center px-3 py-0.5 rounded-md border border-ping-badge-stroke text-sm font-medium leading-[1.5] uppercase transition-colors ${
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
                  id={post.id}
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
