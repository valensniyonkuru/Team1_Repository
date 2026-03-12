import React from "react";
import { Link } from "react-router-dom";

const EmailVerificationPrompt = ({ email, resendStatus, onResend }) => (
  <div className="flex flex-col items-center gap-8 text-center">
    <img src="/assets/Logo.svg" alt="Ping" className="h-[38px] w-[100px]" />
    <div className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-[#e1effe]">
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1e429f"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    </div>
    <div className="flex flex-col items-center gap-3">
      <h1 className="font-poppins text-[28px] font-semibold text-ping-heading leading-tight">
        Check your inbox
      </h1>
      <p className="font-inter text-base font-normal text-ping-body leading-relaxed">
        We've sent a verification link to
        <br />
        <span className="font-semibold text-ping-body-primary">{email}</span>
      </p>
      <p className="font-inter text-sm text-ping-body">
        Click the link in the email to activate your account. If you don't see
        it, check your spam folder.
      </p>
    </div>
    <div className="flex flex-col gap-3 w-full">
      {resendStatus === "sent" && (
        <p className="text-sm font-medium font-inter text-green-600">
          Verification email resent!
        </p>
      )}
      {resendStatus === "error" && (
        <p className="text-sm font-medium font-inter text-[#c81e1e]">
          Failed to resend. Please try again.
        </p>
      )}
      <button
        onClick={onResend}
        disabled={resendStatus === "sending"}
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
);

export default EmailVerificationPrompt;
