import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.register({ name, email, password });
      // The backend returns user info in res.data.data and the token might be named accessToken
      const payload = res.data.data || res.data;
      const token = payload.accessToken || payload.token;
      
      login({ name: payload.name, email: payload.email, role: payload.role }, token);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.errors && Object.keys(err.response.data.errors).length > 0) {
          // If there are field errors, show the first one
          const firstErrorKey = Object.keys(err.response.data.errors)[0];
          setError(err.response.data.errors[firstErrorKey]);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Registration failed.");
        }
      } else {
        setError("Registration failed. Email may already be in use.");
      }
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-md">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Register</h1>
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
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
            placeholder="Password (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2.5 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
