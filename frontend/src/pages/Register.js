import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6f7c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6f7c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6f7c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6f7c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6f7c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendStatus, setResendStatus] = useState(""); // "", "sending", "sent", "error"
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await authAPI.register({ name, email, password });
      
      const payload = res.data.data || res.data;
      const token = payload.accessToken || payload.token;
      const refreshToken = payload.refreshToken;

      login({ name: payload.name, email: payload.email, role: payload.role }, token, refreshToken);
      
      setRegisteredEmail(email);
      setRegistered(true);
    } catch (err) {
      if (err.response?.data) {
        if (err.response.data.errors && Object.keys(err.response.data.errors).length > 0) {
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

  const handleResend = async () => {
    try {
      setResendStatus("sending");
      await authAPI.resendVerification({ email: registeredEmail });
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-ping-bg px-0 sm:px-6">
      <div className="w-full max-w-[428px] rounded-none sm:rounded-3xl sm:border border-ping-stroke px-6 sm:px-8 py-6">
        {registered ? (
          <div className="flex flex-col items-center gap-8 text-center">
            <img src="/assets/Logo.svg" alt="Ping" className="h-[38px] w-[100px]" />
            {/* Mail illustration */}
            <div className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-[#e1effe]">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1e429f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div className="flex flex-col items-center gap-3">
              <h1 className="font-poppins text-[28px] font-semibold text-ping-heading leading-tight">
                Check your inbox
              </h1>
              <p className="font-inter text-base font-normal text-ping-body leading-relaxed">
                We've sent a verification link to<br />
                <span className="font-semibold text-ping-body-primary">{registeredEmail}</span>
              </p>
              <p className="font-inter text-sm text-ping-body">
                Click the link in the email to activate your account. If you don't see it, check your spam folder.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {resendStatus === "sent" && (
                <p className="text-sm font-medium font-inter text-green-600">Verification email resent!</p>
              )}
              {resendStatus === "error" && (
                <p className="text-sm font-medium font-inter text-[#c81e1e]">Failed to resend. Please try again.</p>
              )}
              <button
                onClick={handleResend}
                disabled={resendStatus === "sending" || resendStatus === "sent"}
                className="w-full rounded-lg border border-ping-stroke bg-white py-2.5 font-inter text-sm font-medium text-ping-body-primary transition-colors hover:bg-ping-bg disabled:opacity-50"
              >
                {resendStatus === "sending" ? "Sending..." : "Resend verification email"}
              </button>
              <Link
                to="/login"
                className="w-full rounded-lg bg-ping-dark py-2.5 font-inter text-sm font-medium text-white text-center transition-colors hover:bg-ping-dark/90"
              >
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
        <div className="flex flex-col items-center gap-12">
          {/* Logo + Header */}
          <div className="flex flex-col items-center gap-8">
            <img src="/assets/Logo.svg" alt="Ping" className="h-[38px] w-[100px]" />
            <div className="flex flex-col items-center text-center leading-normal">
              <h1 className="font-poppins text-[32px] font-semibold text-ping-heading">
                Join the Community
              </h1>
              <p className="font-inter text-base font-medium text-ping-body">
                Create an account to get started
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-[30px]">
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-4">
              {/* Full Name Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-name" className="font-inter text-sm font-medium leading-normal text-ping-body-primary">
                  Full Name
                </label>
                <div className="flex items-center gap-2.5 rounded-lg border border-ping-input-border bg-ping-input-bg px-4 py-3">
                  <UserIcon />
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="e.g., John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="flex-1 bg-transparent font-inter text-sm font-normal leading-tight text-ping-body-primary placeholder:text-ping-placeholder focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-email" className="font-inter text-sm font-medium leading-normal text-ping-body-primary">
                  Email
                </label>
                <div className="flex items-center gap-2.5 rounded-lg border border-ping-input-border bg-ping-input-bg px-4 py-3">
                  <MailIcon />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="your@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-transparent font-inter text-sm font-normal leading-tight text-ping-body-primary placeholder:text-ping-placeholder focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-password" className="font-inter text-sm font-medium leading-normal text-ping-body-primary">
                  Password
                </label>
                <div className="flex items-center gap-2.5 rounded-lg border border-ping-input-border bg-ping-input-bg px-4 py-3">
                  <LockIcon />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex-1 bg-transparent font-inter text-sm font-normal leading-tight text-ping-body-primary placeholder:text-ping-placeholder focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
                <p className="font-inter text-sm font-normal leading-tight text-ping-body">
                  Minimum of 6 characters including special characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-confirm-password" className="font-inter text-sm font-medium leading-normal text-ping-body-primary">
                  Confirm Password
                </label>
                <div className="flex items-center gap-2.5 rounded-lg border border-ping-input-border bg-ping-input-bg px-4 py-3">
                  <LockIcon />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="flex-1 bg-transparent font-inter text-sm font-normal leading-tight text-ping-body-primary placeholder:text-ping-placeholder focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="shrink-0 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
              </div>
            </div>

            {/* Button + Link */}
            <div className="flex flex-col gap-5">
              <button
                type="submit"
                className="w-full rounded-lg bg-ping-dark px-5 py-2.5 font-inter text-sm font-medium text-white transition-colors hover:bg-ping-dark/90"
              >
                Register
              </button>
              <div className="flex items-center justify-center gap-1">
                <span className="font-inter text-sm font-medium text-ping-body">
                  Already have an account?
                </span>
                <Link
                  to="/login"
                  className="px-2 py-1 font-inter text-sm font-medium text-ping-orange underline"
                >
                  Log in
                </Link>
              </div>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  );
};

export default Register;
