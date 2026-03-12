import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "./icons";

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
            <MailIcon color={error ? "#c81e1e" : "#5a6f7c"} />
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