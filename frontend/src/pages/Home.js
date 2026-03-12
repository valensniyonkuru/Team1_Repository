import React, { useEffect, useState, useCallback } from "react";
import { postAPI, categoryAPI } from "../services/api";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import { timeAgo } from "../utils/formatDate";
import { SearchIcon, CloseIcon, PlusIcon } from "../components/icons";

const PAGE_SIZE = 10;

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Server-paged posts (normal mode)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState(["All"]);

  // Date-range filter state
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // All posts cache (used when date filter is active)
  const [allPosts, setAllPosts] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);

  // True when at least one date input has a value
  const isDateFiltered = !!(dateFrom || dateTo);

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

  // Fetch all posts from the server (used for client-side date filtering)
  const fetchAllPosts = useCallback(() => {
    setLoadingAll(true);
    postAPI
      .getAll(0, 1000)
      .then((res) => {
        const payload = res.data?.data || res.data;
        setAllPosts(payload.content || []);
      })
      .catch(() => setAllPosts([]))
      .finally(() => setLoadingAll(false));
  }, []);

  // Load the full dataset when date filtering becomes active
  useEffect(() => {
    if (isDateFiltered && allPosts === null) {
      fetchAllPosts();
    }
    if (!isDateFiltered) {
      setAllPosts(null);
    }
  }, [isDateFiltered, allPosts, fetchAllPosts]);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    postAPI
      .getAll(currentPage - 1, PAGE_SIZE)
      .then((res) => {
        const payload = res.data.data || res.data;
        setPosts(payload.content || []);
        setTotalPages(payload.totalPages || 1);
      })
      .catch((err) => console.error("Failed to load posts", err))
      .finally(() => setLoading(false));
  }, [currentPage]);

  // Run server-page fetch only when not in date-filter mode
  useEffect(() => {
    if (!isDateFiltered) fetchPosts();
  }, [fetchPosts, isDateFiltered]);

  // Reset to page 1 whenever a filter dimension changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo, activeCategory, searchTerm]);

  // Apply all filters to whichever data source is active
  const fullyFiltered = (isDateFiltered ? (allPosts ?? []) : posts).filter((p) => {
    if (activeCategory !== "All" && p.categoryName !== activeCategory) return false;
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (dateFrom && new Date(p.createdAt) < new Date(dateFrom)) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(p.createdAt) > end) return false;
    }
    return true;
  });

  // When date-filtering, slice the full result set for the current page
  const displayedPosts = isDateFiltered
    ? fullyFiltered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : fullyFiltered;

  const effectiveTotalPages = isDateFiltered
    ? Math.max(1, Math.ceil(fullyFiltered.length / PAGE_SIZE))
    : totalPages;

  const handleClearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setShowDateFilter(false);
    setCurrentPage(1);
  };

  const handlePostCreated = () => {
    // Invalidate the all-posts cache so it reloads if date filter re-opens
    setAllPosts(null);
    fetchPosts();
  };

  if (loading && !isDateFiltered) {
    return (
      <div className="mt-8 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ping-dark border-t-transparent" />
      </div>
    );
  }

  let postsContent;
  if (loadingAll) {
    postsContent = (
      <div className="flex items-center justify-center w-full mt-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ping-dark border-t-transparent" />
      </div>
    );
  } else if (displayedPosts.length === 0) {
    postsContent = (
      <div className="flex flex-col items-center justify-center w-full mt-10 gap-6">
        <img
          src="/assets/messages-empty.svg"
          alt="No posts yet"
          className="w-[280px] h-[280px] object-contain"
        />
        <p className="font-normal text-base text-ping-placeholder">
          {isDateFiltered ? "No posts match the selected date range" : "No posts have been made yet"}
        </p>
      </div>
    );
  } else {
    postsContent = (
      <div className="flex flex-col gap-6 items-end w-full">
        <div className="flex flex-col gap-6 w-full">
          {displayedPosts.map((post) => (
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
        {effectiveTotalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={effectiveTotalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
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

        {/* ── Date Range Filter ────────────────────────── */}
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-3 flex-wrap">
            {showDateFilter ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap w-full">
                <span className="text-sm font-normal text-ping-body-primary whitespace-nowrap">
                  Date range:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={dateTo || undefined}
                    className="bg-ping-input-bg border border-ping-input-border rounded-lg px-3 py-2 text-sm font-normal text-ping-body outline-none focus:border-ping-dark focus:bg-white transition-colors"
                    aria-label="From date"
                  />
                  <span className="text-sm text-ping-placeholder">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom || undefined}
                    className="bg-ping-input-bg border border-ping-input-border rounded-lg px-3 py-2 text-sm font-normal text-ping-body outline-none focus:border-ping-dark focus:bg-white transition-colors"
                    aria-label="To date"
                  />
                </div>
                {isDateFiltered && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ping-badge-green-bg border border-ping-badge-green-border text-xs font-medium text-ping-badge-green-text">
                    {fullyFiltered.length} {fullyFiltered.length === 1 ? "result" : "results"}
                  </span>
                )}
                <button
                  onClick={handleClearDateFilter}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ping-stroke text-sm font-medium text-ping-body hover:bg-gray-50 transition-colors"
                >
                  <CloseIcon size={14} color="#395362" />
                  Clear
                </button>
              </div>            ) : (
              <button
                onClick={() => setShowDateFilter(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-ping-stroke bg-ping-bg text-sm font-medium text-ping-body hover:bg-gray-50 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Filter by date
              </button>            )}
          </div>

          {/* Loading indicator while fetching all posts */}
          {loadingAll && (
            <div className="flex items-center gap-2 text-sm text-ping-placeholder">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-ping-dark border-t-transparent" />
              Loading posts for date filter…
            </div>
          )}
        </div>

        {/* ── Posts + Pagination ────────────────────────── */}
        {postsContent}
      </div>
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Home;
