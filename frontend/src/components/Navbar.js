import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between bg-ink px-8 py-4 text-white shadow-md">
      <Link to="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
        CommunityBoard
      </Link>
      <div className="flex items-center gap-5 text-sm">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        {user ? (
          <>
            <Link to="/create-post" className="rounded-md bg-primary px-4 py-2 font-medium hover:bg-primary-hover transition-colors">
              New Post
            </Link>
            <span className="text-gray-300">Hi, {user.name}</span>
            <button
              onClick={logout}
              className="rounded-md border border-gray-500 px-3 py-1.5 text-gray-300 hover:border-white hover:text-white transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
            <Link to="/register" className="rounded-md bg-primary px-4 py-2 font-medium hover:bg-primary-hover transition-colors">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
