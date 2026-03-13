import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { postAPI, categoryAPI } from "../services/api";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import { timeAgo } from "../utils/formatDate";
import { SearchIcon, CloseIcon, PlusIcon } from "../components/icons";
import PageLoader from "../components/Spinner";
import SwipeToDelete from "../components/SwipeToDelete";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 350;

const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState([{ id: null, name: "All" }]);

  // Date-range filter state
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // All-results cache used when date filter is active (backend doesn't support date params)
  const [allResults, setAllResults] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);

  const isDateFiltered = !!(dateFrom || dateTo);

  // Debounce search input
  const debounceTimer = useRef(null);
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    categoryAPI
      .getAll()
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const cats = Array.isArray(data) ? data : [];
        setCategories([{ id: null, name: "All" }, ...cats]);
      })
      .catch(() => {});
  }, []);

  // Server-paged fetch â€” used when date filter is NOT active
  const fetchPosts = useCallback(() => {
    setLoading(true);
    const params = { page: currentPage - 1, size: PAGE_SIZE };
    if (debouncedSearch) params.keyword = debouncedSearch;
    if (activeCategoryId) params.categoryId = activeCategoryId;

    postAPI
      .search(params)
      .then((res) => {
        const payload = res.data?.data || res.data;
        setPosts(payload.content || []);
        setTotalPages(payload.totalPages || 1);
        setTotalElements(payload.totalElements ?? 0);
      })
      .catch((err) => console.error("Failed to load posts", err))
      .finally(() => setLoading(false));
  }, [currentPage, debouncedSearch, activeCategoryId]);

  // Bulk fetch (keyword + category only) for client-side date filtering
  const fetchAllForDateFilter = useCallback(() => {
    setLoadingAll(true);
    const params = { page: 0, size: 1000 };
    if (debouncedSearch) params.keyword = debouncedSearch;
    if (activeCategoryId) params.categoryId = activeCategoryId;

    postAPI
      .search(params)
      .then((res) => {
        const payload = res.data?.data || res.data;
        setAllResults(payload.content || []);
      })
      .catch(() => setAllResults([]))
      .finally(() => setLoadingAll(false));
  }, [debouncedSearch, activeCategoryId]);

  // When date filter activates (or keyword/category change while active), reload bulk set
  useEffect(() => {
    if (isDateFiltered) {
      setAllResults(null);
      fetchAllForDateFilter();
    } else {
      setAllResults(null);
    }
  }, [isDateFiltered, fetchAllForDateFilter]);

  // Server-paged fetch when not in date-filter mode
  useEffect(() => {
    if (!isDateFiltered) fetchPosts();
  }, [fetchPosts, isDateFiltered]);

  // Re-fetch when navigated here after creating a post from the standalone page
  useEffect(() => {
    if (location.state?.postCreated) {
      setCurrentPage(1);
      if (isDateFiltered) fetchAllForDateFilter(); else fetchPosts();
      // Clear the state so a browser back/forward doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [location.state?.postCreated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeCategoryId, dateFrom, dateTo]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.name);
    setActiveCategoryId(cat.id);
    setCurrentPage(1);
  };

  const handleClearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setShowDateFilter(false);
    setCurrentPage(1);
  };

  const handleDeletePost = useCallback(async (postId) => {
    try {
      await postAPI.delete(postId);
      if (isDateFiltered) fetchAllForDateFilter(); else fetchPosts();
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  }, [fetchPosts, fetchAllForDateFilter, isDateFiltered]);

  const handlePostCreated = () => {
    setCurrentPage(1);
    if (isDateFiltered) fetchAllForDateFilter(); else fetchPosts();
  };

  // Client-side date filtering on the bulk result set
  const dateFiltered = (allResults ?? []).filter((p) => {
    if (dateFrom && new Date(p.createdAt) < new Date(dateFrom)) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(p.createdAt) > end) return false;
    }
    return true;
  });

  const displayedPosts = isDateFiltered
    ? dateFiltered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : posts;

  const effectiveTotalPages = isDateFiltered
    ? Math.max(1, Math.ceil(dateFiltered.length / PAGE_SIZE))
    : totalPages;

  const effectiveTotalElements = isDateFiltered ? dateFiltered.length : totalElements;

  if (loading && !isDateFiltered && currentPage === 1 && !debouncedSearch && !activeCategoryId) {
    return <PageLoader className="mt-8 min-h-[50vh]" />;
  }

  let postsContent;
  if (loading || loadingAll) {
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
          {debouncedSearch || activeCategoryId || isDateFiltered
            ? "No posts match your filters"
            : "No posts have been made yet"}
        </p>
      </div>
    );
  } else {
    postsContent = (
      <div className="flex flex-col gap-6 items-end w-full">
        <div className="flex flex-col gap-6 w-full">
          {displayedPosts.map((post) => (
            <SwipeToDelete
              key={post.id}
              onDelete={() => handleDeletePost(post.id)}
              disabled={!user || (user.name !== post.authorName && user.role !== "ADMIN")}
              label="Delete Post"
            >
              <PostCard
                id={post.id}
                title={post.title}
                body={post.content}
                category={post.categoryName}
                author={post.authorName}
                time={timeAgo(post.createdAt)}
                commentCount={post.commentCount ?? 0}
              />
            </SwipeToDelete>
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
        {/* â”€â”€ Search Bar + Create Post â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="focus:outline-none flex items-center justify-center"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
            <button
              onClick={() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }}
              className="bg-ping-dark rounded-lg px-3 py-2.5 flex items-center justify-center flex-shrink-0 transition-colors hover:bg-opacity-90"
            >
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

        {/* â”€â”€ Category Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-start md:items-center gap-4 flex-col md:flex-row w-full">
          <span className="hidden md:inline-block font-normal text-base text-ping-body-primary leading-[1.5]">
            Categories:
          </span>
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id ?? "all"}
                onClick={() => handleCategoryClick(cat)}
                className={`flex items-center justify-center px-3 py-0.5 rounded-md border border-ping-badge-stroke text-sm font-medium leading-[1.5] uppercase transition-colors ${
                  activeCategory === cat.name
                    ? "bg-ping-badge-bg text-ping-dark"
                    : "bg-ping-bg text-ping-dark hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* â”€â”€ Date Range Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                    onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                    max={dateTo || undefined}
                    className="bg-ping-input-bg border border-ping-input-border rounded-lg px-3 py-2 text-sm font-normal text-ping-body outline-none focus:border-ping-dark focus:bg-white transition-colors"
                    aria-label="From date"
                  />
                  <span className="text-sm text-ping-placeholder">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                    min={dateFrom || undefined}
                    className="bg-ping-input-bg border border-ping-input-border rounded-lg px-3 py-2 text-sm font-normal text-ping-body outline-none focus:border-ping-dark focus:bg-white transition-colors"
                    aria-label="To date"
                  />
                </div>
                {isDateFiltered && !loadingAll && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ping-badge-green-bg border border-ping-badge-green-border text-xs font-medium text-ping-badge-green-text">
                    {effectiveTotalElements} {effectiveTotalElements === 1 ? "result" : "results"}
                  </span>
                )}
                <button
                  onClick={handleClearDateFilter}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ping-stroke text-sm font-medium text-ping-body hover:bg-gray-50 transition-colors"
                >
                  <CloseIcon size={14} color="#395362" />
                  Clear
                </button>
              </div>
            ) : (
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
              </button>
            )}
          </div>
        </div>

        {/* â”€â”€ Posts + Pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
