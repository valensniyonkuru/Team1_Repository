import React, { useState, useEffect, useRef } from "react";
import { postAPI, categoryAPI } from "../services/api";
import { CloseIcon, ChevronDown, HomeIcon, ChevronRight, HamburgerIcon } from "../components/icons";

/* ─── Create Post Modal Component ────────────────────────── */

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      categoryAPI
        .getAll()
        .then((res) => {
          setCategories(res.data.data || res.data);
        })
        .catch((err) => console.error("Failed to fetch categories", err));
      
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!title || !content || !categoryId) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await postAPI.create({ title, content, categoryId });
      onPostCreated();
      setTitle("");
      setContent("");
      setCategoryId("");
      onClose();
    } catch (err) {
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find((c) => c.id.toString() === categoryId.toString());

  return (
    <div className="fixed inset-0 z-[100] bg-ping-bg md:bg-ping-dark md:bg-opacity-50 flex items-center justify-center p-0 md:p-4 font-inter">
      <div className="bg-ping-bg w-full h-full md:h-auto md:max-w-[542px] md:rounded-[14px] shadow-xl overflow-y-auto animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Mobile Header (Nav + Breadcrumb) */}
        <div className="md:hidden w-full flex flex-col shrink-0">
          {/* Mobile Nav */}
          <div className="w-full flex items-center justify-between px-6 py-[10px] border-b border-ping-stroke">
            <div className="flex items-center">
              <img src="/assets/Logo.svg" alt="Logo" className="h-[30px]" />
            </div>
            <button className="p-1">
              <HamburgerIcon />
            </button>
          </div>
          
          {/* Breadcrumb */}
          <div className="px-6 py-6">
            <div className="inline-flex items-center gap-4 bg-ping-bg border border-ping-stroke rounded-lg px-5 py-3">
              <HomeIcon />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ping-dark">Home</span>
                <ChevronRight color="#08283b" />
                <span className="text-sm font-medium text-ping-dark">Create Post</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-6 pb-4 shrink-0">
          <h2 className="text-xl font-semibold text-ping-heading leading-[1.5]">
            Create New Post
          </h2>
          <button
            onClick={onClose}
            className="text-ping-body hover:text-ping-dark transition-colors"
          >
            <CloseIcon opacity="0.6" />
          </button>
        </div>

        {/* Modal content area */}
        <div className="flex-1 px-6 md:pb-6 flex flex-col gap-6">
          {/* Mobile Heading (Visible on Mobile) */}
          <h2 className="md:hidden text-xl font-semibold text-ping-heading leading-[1.5]">
            Create New Post
          </h2>

          <div className="flex flex-col gap-6">
            {/* Post Title */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-ping-dark">
                Post Title
              </label>
              <div className="bg-ping-input-bg border border-ping-input-border rounded-lg px-4 py-3">
                <input
                  type="text"
                  placeholder="Enter a clear, descriptive title"
                  className="bg-transparent border-none outline-none w-full text-sm text-ping-body placeholder:text-ping-placeholder font-normal leading-tight"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
              <label className="text-sm font-medium text-ping-dark">
                Category
              </label>
              <button
                type="button"
                className="bg-ping-input-bg border border-ping-input-border rounded-lg px-4 py-3 text-sm text-ping-body flex items-center justify-between hover:border-ping-dark transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={selectedCategory ? "text-ping-body" : "text-ping-placeholder"}>
                  {selectedCategory ? selectedCategory.name : "Select"}
                </span>
                <ChevronDown />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-ping-stroke rounded-lg shadow-lg z-10 py-1 overflow-hidden">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-ping-body hover:bg-gray-50 hover:text-ping-dark transition-colors"
                      onClick={() => {
                        setCategoryId(cat.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Textarea */}
            <div className="flex flex-col gap-3">
              <div className="bg-ping-input-bg border border-ping-input-border rounded-lg px-4 py-3 min-h-[218px]">
                <textarea
                  placeholder="Share the details of your post..."
                  className="bg-transparent border-none outline-none w-full h-[200px] text-sm text-ping-body placeholder:text-ping-placeholder font-normal resize-none leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-ping-error-text text-sm">{error}</p>}

          {/* Buttons */}
          <div className="mt-auto md:mt-4 flex gap-4 w-full pb-6 md:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-ping-dark rounded-lg py-2.5 text-sm font-medium text-ping-dark hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-ping-dark rounded-lg py-2.5 text-sm font-medium text-white hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
