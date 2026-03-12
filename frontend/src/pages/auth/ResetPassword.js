import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import { EyeIcon, EyeOffIcon } from "../../components/icons";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await authAPI.resetPassword({ 
        token, 
        password, 
        passwordConfirmation: confirmPassword 
      });
      setStatus("success");
      setMessage("Password successfully reset! You can now log in.");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to reset password. The link might be expired.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-ping-bg px-4 sm:px-6">
      <div className="w-full max-w-[428px] rounded-none sm:rounded-3xl sm:border border-ping-stroke bg-white px-6 py-8 sm:px-8 shadow-sm">
        <div className="flex flex-col items-center gap-8">
          <img src="/assets/Logo.svg" alt="Ping" className="h-[38px] w-[100px]" />

          <div className="flex flex-col items-center text-center leading-normal">
            <h1 className="font-poppins text-2xl font-semibold text-ping-heading">
              New Password
            </h1>
            <p className="font-inter text-sm font-medium text-ping-body mt-2">
              Create a new, strong password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
            {status === "error" && (
              <p className="rounded-lg bg-ping-error-bg px-4 py-2 text-sm font-medium text-ping-error-text border border-ping-error-border">
                {message}
              </p>
            )}

            {status === "success" ? (
              <div className="flex flex-col gap-4">
                <p className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 border border-green-200">
                  {message}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full rounded-lg bg-ping-dark py-3 font-inter text-sm font-medium text-white transition-colors hover:bg-ping-dark/90 focus:outline-none"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 relative">
                  <label className="font-inter text-sm font-medium text-ping-body-primary">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-ping-input-border bg-ping-input-bg pr-10 pl-4 py-3 font-inter text-sm outline-none transition-colors placeholder:text-ping-placeholder focus:border-ping-dark focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ping-placeholder"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="font-inter text-sm font-medium text-ping-body-primary">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-ping-input-border bg-ping-input-bg pr-10 pl-4 py-3 font-inter text-sm outline-none transition-colors placeholder:text-ping-placeholder focus:border-ping-dark focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ping-placeholder"
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 flex justify-center rounded-lg bg-ping-dark py-3 font-inter text-sm font-medium text-white transition-colors hover:bg-ping-dark/90 disabled:opacity-70 focus:outline-none"
                >
                  {status === "loading" ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
