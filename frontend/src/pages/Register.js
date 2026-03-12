import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "../components/icons";
import EmailVerificationPrompt from "../components/EmailVerificationPrompt";

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
          <EmailVerificationPrompt
            email={registeredEmail}
            resendStatus={resendStatus}
            onResend={handleResend}
          />
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
                  <MailIcon />
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
                className="w-full rounded-lg bg-ping-dark px-5 py-[12px] font-inter text-[16px] font-medium text-white transition-colors hover:bg-ping-dark/90"
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
