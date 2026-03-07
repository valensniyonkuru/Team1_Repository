import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(
        { name: res.data.name, email: res.data.email, role: res.data.role },
        res.data.token
      );
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfdfd] px-4">
      <div id="login-card" className="w-full max-w-[428px] rounded-3xl border border-[#e6eaeb] px-8 py-6">
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
                Welcome back
              </h1>
              <p className="text-base font-medium leading-[1.5] text-[#395362]">
                Sign in to your neighborhood community
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            id="login-form"
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-[30px]"
          >
            <div className="flex flex-col gap-4">
              {error && (
                <p id="login-error" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-[#c81e1e]">
                  {error}
                </p>
              )}

              {/* Email */}
              <fieldset className="flex flex-col gap-2">
                <label
                  htmlFor="login-email"
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
                    id="login-email"
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
                  htmlFor="login-password"
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
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border-0 bg-transparent p-0 text-sm font-normal leading-[1.25] text-[#08283b] placeholder:text-[#5a6f7c] focus:outline-none"
                  />
                  <button
                    id="login-toggle-password"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="shrink-0 text-[#5a6f7c] hover:text-[#08283b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08283b]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
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
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#08283b] px-5 py-[10px] text-sm font-medium leading-[1.5] text-[#fdfdfd] transition-colors hover:bg-[#0a3550] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08283b] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Log In"}
              </button>

              <p className="flex items-center justify-center gap-[5px] text-sm font-medium leading-[1.5] text-[#395362]">
                Don&apos;t have an account?
                <Link
                  id="login-register-link"
                  to="/register"
                  className="px-2 py-1 text-sm font-medium leading-[1.5] text-[#b54000] underline decoration-solid hover:text-[#8a3100] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b54000]"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
