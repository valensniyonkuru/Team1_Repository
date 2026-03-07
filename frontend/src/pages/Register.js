import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      login({ name: res.data.name, email: res.data.email, role: res.data.role }, res.data.token);
      navigate("/");
    } catch (err) {
      setError("Registration failed. Email may already be in use.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h1>Register</h1>
      {error && <p id="register-error" style={{ color: "red" }}>{error}</p>}
      <form id="register-form" onSubmit={handleSubmit}>
        <input id="register-name" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input id="register-email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input id="register-password" type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button id="register-submit" type="submit" className="btn btn-primary" style={{ width: "100%" }}>Register</button>
      </form>
    </div>
  );
};

export default Register;
