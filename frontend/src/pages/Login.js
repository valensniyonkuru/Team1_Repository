import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.login({ email, password });
      
      const payload = res.data.data || res.data;
      const token = payload.accessToken || payload.token;

      login({ name: payload.name, email: payload.email, role: payload.role }, token);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid email or password");
      }
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-md">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Login</h1>
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2.5 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
