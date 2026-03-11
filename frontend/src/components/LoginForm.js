import React, { useState } from "react";
import { Link } from "react-router-dom";

const MailIcon = ({ hasError }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hasError ? "#c81e1e" : "#5a6f7c"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const LoginForm = ({ email, password, setEmail, setPassword, error, setError, handleSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-[30px]">
      <div className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="login-email" className="font-inter text-sm font-medium leading-normal text-ping-body-primary">
            Email
          </label>
          <div className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 ${error ? "border-ping-error-border bg-ping-error-bg" : "border-ping-input-border bg-ping-input-bg"}`}>
            <MailIcon hasError={!!error} />
            <input
              id="login-email"
              data-testid="email-input"
              type="email"
              placeholder="your@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              required
              className={`flex-1 bg-transparent font-inter text-sm font-normal leading-tight focus:outline-none ${error ? "text-ping-error-text placeholder:text-ping-error-text" : "text-ping-body-primary placeholder:text-ping-placeholder"}`}
            />
          </div>
          {error && (
            <p className="font-inter text-sm font-normal leading-tight text-ping-error-text text-left">
              {error}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="login-password" className="font-inter text-sm font-medium leading-normal text-ping-body-primary">
            Password
          </label>
          <div className="flex items-center gap-2.5 rounded-lg border border-ping-input-border bg-ping-input-bg px-4 py-3">
            <LockIcon />
            <input
              id="login-password"
              data-testid="password-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
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
        </div>
      </div>
      <div className="flex w-full items-center justify-end -mt-3 mb-2">
        <Link to="/forgot-password" className="font-inter text-sm font-medium text-ping-dark hover:underline">
          Forgot password?
        </Link>
      </div>
      {/* Button + Link */}
      <div className="flex flex-col gap-5">
        <button
          type="submit"
          data-testid="login-button"
          className="w-full rounded-lg bg-ping-dark px-5 py-2.5 font-inter text-sm font-medium text-white transition-colors hover:bg-ping-dark/90"
        >
          Log In
        </button>
        <div className="flex items-center justify-center gap-1">
          <span className="font-inter text-sm font-medium text-ping-body">
            Don't have an account?
          </span>
          <Link
            to="/register"
            className="px-2 py-1 font-inter text-sm font-medium text-ping-orange underline"
          >
            Create one now
          </Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;