import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshTokenState] = useState(localStorage.getItem("refreshToken"));

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, [token]);

  const login = (userData, authToken, newRefreshToken) => {
    setUser(userData);
    setToken(authToken);
    setRefreshTokenState(newRefreshToken);
    localStorage.setItem("token", authToken);
    if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Call backend to invalidate token session
      await authAPI.logout();
    } catch (e) {
      console.warn("Backend logout failed, proceeding with local clear.", e);
    } finally {
      setUser(null);
      setToken(null);
      setRefreshTokenState(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
