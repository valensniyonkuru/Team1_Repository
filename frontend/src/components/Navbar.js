import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  return (
    <nav id="navbar" className="w-full border-b border-[#e6eaeb] bg-white px-8 lg:px-[120px] py-[10px]">
      <div className="flex items-center justify-between">
        <Link id="navbar-logo" to="/" className="block" aria-label="Ping home">
          <img
            src="/assets/Logo.svg"
            alt="Ping"
            className="h-[38px] w-[100px]"
          />
        </Link>

        <div className="flex items-center gap-5">
          {user ? (
            <>
              <Link
                id="navbar-analytics"
                to="/"
                className="flex items-center gap-2 rounded-lg px-5 py-[10px] text-sm font-medium text-[#061c2a] hover:bg-[#f5f6fa] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#061c2a]"
              >
                <img
                  src="/assets/chart-column.svg"
                  alt=""
                  className="h-5 w-5"
                  aria-hidden="true"
                />
                Analytics
              </Link>

              <div id="navbar-user-info" className="flex items-center gap-[10px]">
                <div
                  id="navbar-avatar"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c3c3c2] select-none"
                  aria-hidden="true"
                >
                  <span className="text-xs font-medium leading-none text-[#222220]">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span id="navbar-user-name" className="text-sm font-semibold leading-[14px] text-[#08283b]">
                    {user.name}
                  </span>
                  <span id="navbar-user-email" className="text-xs font-normal leading-[12px] text-[#395362]">
                    {user.email}
                  </span>
                </div>
              </div>

              <a
                id="navbar-logout"
                href="#logout"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-5 py-[10px] text-sm font-medium text-[#c81e1e] hover:bg-red-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81e1e]"
                role="button"
              >
                <img
                  src="/assets/log-out.svg"
                  alt=""
                  className="h-5 w-5"
                  aria-hidden="true"
                />
                Log out
              </a>
            </>
          ) : (
            <>
              <Link
                id="navbar-login"
                to="/login"
                className="flex items-center gap-2 rounded-lg px-5 py-[10px] text-sm font-medium text-[#061c2a] hover:bg-[#f5f6fa] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#061c2a]"
              >
                Login
              </Link>
              <Link
                id="navbar-register"
                to="/register"
                className="flex items-center gap-2 rounded-lg bg-[#08283b] px-5 py-[10px] text-sm font-medium text-white hover:bg-[#0a3550] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
