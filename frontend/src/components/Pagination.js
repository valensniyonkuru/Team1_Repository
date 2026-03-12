import React from "react";

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

export default Pagination;
