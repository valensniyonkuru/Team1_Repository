import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LoginForm from "../components/LoginForm";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.login({ email, password });

      const payload = res.data.data || res.data;
      const token = payload.accessToken || payload.token;
      const refreshToken = payload.refreshToken;

      login({ name: payload.name, email: payload.email, role: payload.role }, token, refreshToken);
      showToast("Authenticated successfully", "success");
      navigate("/");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid email or password");
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-ping-bg px-0 sm:px-6">
      <div className="w-full max-w-[428px] rounded-none sm:rounded-3xl sm:border border-ping-stroke px-6 sm:px-8 py-6">
        <div className="flex flex-col items-center gap-12">
          {/* Logo + Header */}
          <div className="flex flex-col items-center gap-8">
            <img src="/assets/Logo.svg" alt="Ping" className="h-[38px] w-[100px]" />
            <div className="flex flex-col items-center text-center leading-normal">
              <h1 className="font-poppins text-[32px] font-semibold text-ping-heading">
                Welcome back
              </h1>
              <p className="font-inter text-base font-medium text-ping-body">
                Sign in to your neighborhood community
              </p>
            </div>
          </div>

          {/* Form */}
          <LoginForm
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            error={error}
            setError={setError}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
