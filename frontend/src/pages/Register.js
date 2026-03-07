import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, EyeOff, Eye } from "lucide-react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      login(
        { name: res.data.name, email: res.data.email, role: res.data.role },
        res.data.token
      );
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Registration failed. Email may already be in use."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfdfd] px-4">
      <div
        id="register-card"
        className="w-full max-w-[428px] border-transparent px-6 py-6 sm:rounded-3xl sm:border-[#e6eaeb] sm:px-8"
      >
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex w-full max-w-[311px] flex-col items-center gap-8">
            <img
              src="/assets/Logo.svg"
              alt="Ping"
              className="h-[38px] w-[100px]"
            />
            <div className="flex w-full flex-col items-center text-center leading-normal">
              <h1 className="font-heading text-[32px] font-semibold leading-[1.5] text-[#041620]">
                Join the Community
              </h1>
              <p className="text-base font-medium leading-[1.5] text-[#395362]">
                Create an account to get started
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            id="register-form"
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-[30px]"
          >
            <div className="flex flex-col gap-4">
              {error && (
                <p
                  id="register-error"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-[#c81e1e]"
                >
                  {error}
                </p>
              )}

              {/* Full Name */}
              <fieldset className="flex flex-col gap-2">
                <label
                  htmlFor="register-name"
                  className="text-sm font-medium leading-[1.5] text-[#08283b]"
                >
                  Full Name
                </label>
                <div className="flex items-center gap-[10px] rounded-lg border border-[#b2bcc2] bg-[#ececeb] px-4 py-3">
                  <User
                    size={16}
                    className="shrink-0 text-[#5a6f7c]"
                    aria-hidden="true"
                  />
                  <input
                    id="register-name"
                    type="text"
                    placeholder="e.g., John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border-0 bg-transparent p-0 text-sm font-normal leading-[1.25] text-[#08283b] placeholder:text-[#5a6f7c] focus:outline-none"
                  />
                </div>
              </fieldset>

              {/* Email */}
              <fieldset className="flex flex-col gap-2">
                <label
                  htmlFor="register-email"
                  className="text-sm font-medium leading-[1.5] text-[#08283b]"
                >
                  Email
                </label>
                <div className="flex items-center gap-[10px] rounded-lg border border-[#b2bcc2] bg-[#ececeb] px-4 py-3">
                  <Mail
                    size={16}
                    className="shrink-0 text-[#5a6f7c]"
                    aria-hidden="true"
                  />
                  <input
                    id="register-email"
                    type="email"
                    placeholder="your@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border-0 bg-transparent p-0 text-sm font-normal leading-[1.25] text-[#08283b] placeholder:text-[#5a6f7c] focus:outline-none"
                  />
                </div>
              </fieldset>

              {/* Password */}
              <fieldset className="flex flex-col gap-2">
                <label
                  htmlFor="register-password"
                  className="text-sm font-medium leading-[1.5] text-[#08283b]"
                >
                  Password
                </label>
                <div className="flex items-center gap-[10px] rounded-lg border border-[#b2bcc2] bg-[#ececeb] px-4 py-3">
                  <Lock
                    size={16}
                    className="shrink-0 text-[#5a6f7c]"
                    aria-hidden="true"
                  />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full border-0 bg-transparent p-0 text-sm font-normal leading-[1.25] text-[#08283b] placeholder:text-[#5a6f7c] focus:outline-none"
                  />
                  <button
                    id="register-toggle-password"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="shrink-0 text-[#5a6f7c] hover:text-[#08283b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08283b]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </button>
                </div>
                <p className="text-sm font-normal leading-[1.25] text-[#395362]">
                  Minimum of 6 characters including special characters
                </p>
              </fieldset>

              {/* Confirm Password */}
              <fieldset className="flex flex-col gap-2">
                <label
                  htmlFor="register-confirm-password"
                  className="text-sm font-medium leading-[1.5] text-[#08283b]"
                >
                  Confirm Password
                </label>
                <div className="flex items-center gap-[10px] rounded-lg border border-[#b2bcc2] bg-[#ececeb] px-4 py-3">
                  <Lock
                    size={16}
                    className="shrink-0 text-[#5a6f7c]"
                    aria-hidden="true"
                  />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full border-0 bg-transparent p-0 text-sm font-normal leading-[1.25] text-[#08283b] placeholder:text-[#5a6f7c] focus:outline-none"
                  />
                  <button
                    id="register-toggle-confirm-password"
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="shrink-0 text-[#5a6f7c] hover:text-[#08283b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08283b]"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </button>
                </div>
              </fieldset>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-5">
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#08283b] px-5 py-[10px] text-sm font-medium leading-[1.5] text-[#fdfdfd] transition-colors hover:bg-[#0a3550] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08283b] disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Register"}
              </button>

              <p className="flex items-center justify-center gap-[5px] text-sm font-medium leading-[1.5] text-[#395362]">
                Already have an account?
                <Link
                  id="register-login-link"
                  to="/login"
                  className="px-2 py-1 text-sm font-medium leading-[1.5] text-[#b54000] underline decoration-solid hover:text-[#8a3100] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b54000]"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
