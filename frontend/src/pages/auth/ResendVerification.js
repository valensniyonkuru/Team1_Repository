import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../services/api";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      await authAPI.resendVerification({ email });
      setStatus("success");
      setMessage("If that email is registered, a new verification link has been sent.");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-ping-bg px-4 sm:px-6">
      <div className="w-full max-w-[428px] rounded-none sm:rounded-3xl sm:border border-ping-stroke bg-white px-6 py-8 sm:px-8 shadow-sm">
        <div className="flex flex-col items-center gap-8">
          <img src="/assets/Logo.svg" alt="Ping" className="h-[38px] w-[100px]" />

          <div className="flex flex-col items-center text-center leading-normal">
            <h1 className="font-poppins text-2xl font-semibold text-ping-heading">
              Resend Verification
            </h1>
            <p className="font-inter text-sm font-medium text-ping-body mt-2">
              Enter the email you registered with to get a new link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
            {status === "error" && (
              <p className="rounded-lg bg-ping-error-bg px-4 py-2 text-sm font-medium text-ping-error-text border border-ping-error-border">
                {message}
              </p>
            )}

            {status === "success" && (
              <p className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 border border-green-200">
                {message}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-inter text-sm font-medium text-ping-body-primary">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex. johndoe@gmail.com"
                className="w-full rounded-lg border border-ping-input-border bg-ping-input-bg px-4 py-3 font-inter text-sm outline-none transition-colors placeholder:text-ping-placeholder focus:border-ping-dark focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="flex justify-center rounded-lg bg-ping-dark py-3 font-inter text-sm font-medium text-white transition-colors hover:bg-ping-dark/90 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-ping-dark/20"
            >
              {status === "loading" ? "Sending..." : "Send Verification Link"}
            </button>
            
            <p className="text-center text-sm font-medium text-ping-body">
              Ready to log in?{" "}
              <Link to="/login" className="text-ping-dark hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
