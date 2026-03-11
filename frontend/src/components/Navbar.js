import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ChartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#061c2a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);

const LogOutIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#c81e1e"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const PenIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#061c2a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#08283b"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#08283b"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const HamburgerIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#08283b"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close menu when navigating
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="flex items-center justify-between border-b border-ping-stroke bg-white px-6 py-2.5 sm:px-12 lg:px-[120px]">
      <Link to="/" className="shrink-0 transition-opacity hover:opacity-90">
        <img
          src="/assets/Logo.svg"
          alt="Ping Logo"
          className="h-[38px] w-[95px] md:w-[100px]"
        />
      </Link>

      {/* Mobile Actions */}
      <div className="flex items-center gap-5 md:hidden">
        {user && (
          <button className="flex items-center justify-center p-1 relative">
            <BellIcon />
          </button>
        )}
        <button
          className="flex items-center justify-center p-1"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <HamburgerIcon />
        </button>
      </div>

      <div className="hidden md:flex items-center gap-5">
        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-5">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 transition-colors hover:bg-gray-100"
              >
                <ChartIcon />
                <span className="font-inter text-sm font-medium text-[#061c2a]">
                  Analytics
                </span>
              </Link>
            </div>

            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="flex size-8 shrink-0 flex-col items-center justify-center rounded-full bg-[#c3c3c2]">
                <span className="font-inter text-xs font-medium text-[#222220]">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="flex flex-col items-start whitespace-nowrap">
                <span className="font-inter text-sm font-semibold leading-[14px] text-ping-body-primary">
                  {user.name}
                </span>
                <span className="font-inter text-xs font-normal leading-[12px] text-ping-body">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-ping-error-bg sm:px-5"
            >
              <LogOutIcon />
              <span className="font-inter text-sm font-medium text-ping-error-text">
                Log out
              </span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="font-inter text-sm font-medium text-ping-body transition-colors hover:text-ping-dark"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-ping-dark px-5 py-2.5 font-inter text-sm font-medium text-white transition-colors hover:bg-ping-dark/90"
            >
              Register
            </Link>
          </>
        )}
      </div>

      {/* ─── Mobile Menu Overlay ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-ping-bg md:hidden font-inter">
          <div className="w-full max-w-[393px] pt-6 px-6 flex flex-col gap-2.5">
            {/* Header: User Profile + Close Button */}
            <div className="flex items-center justify-between w-full">
              {user ? (
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="flex size-8 shrink-0 flex-col items-center justify-center rounded-full bg-[#c3c3c2]">
                    <span className="text-xs font-medium text-[#222220]">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <div className="flex flex-col items-start whitespace-nowrap">
                    <span className="text-sm font-semibold leading-[14px] text-ping-body-primary">
                      {user.name}
                    </span>
                    <span className="text-xs font-normal leading-[12px] text-ping-body">
                      {user.email}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 flex-1">
                  {/* Empty spacer or "Guest" label if unauthenticated */}
                </div>
              )}
              <button
                className="flex items-center justify-center p-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="w-full border-t border-ping-stroke mt-1 mb-1"></div>

            {/* Menu Items */}
            <div className="flex flex-col w-full gap-5 mt-4">
              {user ? (
                <>
                  <Link
                    to="/"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-5 w-full py-2.5 rounded-lg overflow-hidden shrink-0"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <ChartIcon />
                    </div>
                    <span className="text-sm font-medium leading-[1.5] text-[#061c2a]">
                      Analytics
                    </span>
                  </Link>
                  <div className="w-full border-t border-ping-stroke"></div>
                  <button
                    onClick={() => {
                      logout();
                      handleLinkClick();
                    }}
                    className="flex items-center gap-2 px-5 w-full py-2.5 rounded-lg overflow-hidden shrink-0"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <LogOutIcon />
                    </div>
                    <span className="text-sm font-medium leading-[1.5] text-ping-error-text">
                      Log out
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className="text-sm font-medium text-ping-body transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleLinkClick}
                    className="text-sm font-medium text-ping-body transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
