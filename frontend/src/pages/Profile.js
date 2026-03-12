import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { getInitials } from "../utils/formatDate";

// ─── Small re-usable field ────────────────────────────────────────────────────
const FormField = ({ label, id, type = "text", value, onChange, error, placeholder, showToggle, onToggle, visible }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label htmlFor={id} className="text-sm font-medium text-ping-body-primary font-inter">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={showToggle ? (visible ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-ping-input-bg border rounded-lg px-4 py-3 text-sm font-normal font-inter text-ping-body placeholder:text-ping-placeholder outline-none focus:border-ping-dark focus:bg-white transition-colors pr-${showToggle ? "10" : "4"} ${
          error ? "border-ping-error-border bg-ping-error-bg" : "border-ping-input-border"
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-3 flex items-center text-ping-placeholder hover:text-ping-body"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
    </div>
    {error && <p className="text-xs text-ping-error-text font-inter">{error}</p>}
  </div>
);

// ─── Section card wrapper ─────────────────────────────────────────────────────
const Card = ({ title, children }) => (
  <div className="bg-ping-bg border border-ping-stroke rounded-[14px] p-6 flex flex-col gap-5 w-full">
    {title && (
      <h2 className="text-base font-semibold font-inter text-ping-heading">{title}</h2>
    )}
    {children}
  </div>
);

// ─── Stat chip ────────────────────────────────────────────────────────────────
const StatChip = ({ label, value }) => (
  <div className="flex flex-col items-center justify-center gap-0.5 px-5 py-3 bg-ping-input-bg rounded-xl min-w-[88px]">
    <span className="text-xl font-semibold font-inter text-ping-heading">{value}</span>
    <span className="text-xs font-normal font-inter text-ping-body">{label}</span>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const Profile = () => {
  const { user } = useAuth();

  const {
    profile,
    postCount,
    loadingProfile,
    pwForm, setPwForm, pwErrors, pwSubmitting, handleChangePassword,
    emailForm, setEmailForm, emailErrors, emailSubmitting, handleChangeEmail,
    showDeleteConfirm, setShowDeleteConfirm, deleteSubmitting, handleDeleteAccount,
  } = useProfile();

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEmailPw, setShowEmailPw] = useState(false);

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ping-dark border-t-transparent" />
      </div>
    );
  }

  const displayName  = profile?.name  ?? user?.name  ?? "—";
  const displayEmail = profile?.email ?? user?.email ?? "—";
  const roleLabel    = (profile?.role ?? user?.role ?? "USER").replace("ROLE_", "");
  const isAdmin      = roleLabel === "ADMIN";
  const joinedDate   = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col items-center w-full pt-12 pb-16 font-inter">
      <div className="flex flex-col gap-8 w-full max-w-[720px] px-6 xl:px-0">

        {/* ── Profile header ─────────────────────────────── */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#c3c3c2]">
              <span className="text-xl font-semibold font-inter text-[#222220]">
                {getInitials(displayName)}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2 text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl font-semibold font-inter text-ping-heading truncate">
                  {displayName}
                </h1>
                <span
                  className={`self-center sm:self-auto inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-medium ${
                    isAdmin
                      ? "bg-ping-badge-purple-bg border-ping-badge-purple-border text-ping-badge-purple-text"
                      : "bg-ping-badge-green-bg border-ping-badge-green-border text-ping-badge-green-text"
                  }`}
                >
                  {roleLabel}
                </span>
              </div>
              <p className="text-sm text-ping-body truncate">{displayEmail}</p>
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap mt-1">
                {joinedDate && (
                  <span className="flex items-center gap-1 text-xs text-ping-placeholder">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Joined {joinedDate}
                  </span>
                )}
                <span className={`flex items-center gap-1 text-xs font-medium ${profile?.emailVerified ? "text-ping-badge-green-text" : "text-ping-badge-yellow-text"}`}>
                  {profile?.emailVerified ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                  {profile?.emailVerified ? "Email verified" : "Email not verified"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 shrink-0">
              <StatChip label="Posts" value={postCount} />
            </div>
          </div>
        </Card>

        {/* ── Change Password ─────────────────────────────── */}
        <Card title="Change Password">
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4" noValidate>
            {pwErrors.api && (
              <div className="rounded-lg bg-ping-error-bg border border-ping-error-border px-4 py-3 text-sm text-ping-error-text font-inter">
                {pwErrors.api}
              </div>
            )}
            <FormField
              label="Current Password"
              id="currentPassword"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Enter current password"
              error={pwErrors.currentPassword}
              showToggle
              visible={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
            />
            <FormField
              label="New Password"
              id="newPassword"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="8–12 chars, upper, lower, number, symbol"
              error={pwErrors.newPassword}
              showToggle
              visible={showNew}
              onToggle={() => setShowNew((v) => !v)}
            />
            <FormField
              label="Confirm New Password"
              id="confirmPassword"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter new password"
              error={pwErrors.confirmPassword}
              showToggle
              visible={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
            />
            <button
              type="submit"
              disabled={pwSubmitting}
              className="self-start bg-ping-dark text-white rounded-lg px-5 py-2.5 text-sm font-medium font-inter transition-colors hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pwSubmitting ? "Saving…" : "Update Password"}
            </button>
          </form>
        </Card>

        {/* ── Change Email ────────────────────────────────── */}
        <Card title="Change Email">
          <form onSubmit={handleChangeEmail} className="flex flex-col gap-4" noValidate>
            {emailErrors.api && (
              <div className="rounded-lg bg-ping-error-bg border border-ping-error-border px-4 py-3 text-sm text-ping-error-text font-inter">
                {emailErrors.api}
              </div>
            )}
            <FormField
              label="New Email Address"
              id="newEmail"
              type="email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm((f) => ({ ...f, newEmail: e.target.value }))}
              placeholder="Enter new email address"
              error={emailErrors.newEmail}
            />
            <FormField
              label="Confirm Password"
              id="emailPassword"
              value={emailForm.password}
              onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Enter your current password"
              error={emailErrors.password}
              showToggle
              visible={showEmailPw}
              onToggle={() => setShowEmailPw((v) => !v)}
            />
            <button
              type="submit"
              disabled={emailSubmitting}
              className="self-start bg-ping-dark text-white rounded-lg px-5 py-2.5 text-sm font-medium font-inter transition-colors hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {emailSubmitting ? "Saving…" : "Update Email"}
            </button>
          </form>
        </Card>

        {/* ── Danger Zone ─────────────────────────────────── */}
        <div className="bg-ping-error-bg border border-ping-error-border rounded-[14px] p-6 flex flex-col gap-4 w-full">
          <h2 className="text-base font-semibold font-inter text-ping-error-text">Danger Zone</h2>
          <p className="text-sm font-normal font-inter text-ping-body leading-relaxed">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="self-start rounded-lg border border-ping-error-border bg-white px-5 py-2.5 text-sm font-medium font-inter text-ping-error-text transition-colors hover:bg-ping-error-bg"
            >
              Delete Account
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-ping-error-text font-inter">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteSubmitting}
                  className="rounded-lg bg-ping-error-border px-5 py-2.5 text-sm font-medium font-inter text-white transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleteSubmitting ? "Deleting…" : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteSubmitting}
                  className="rounded-lg border border-ping-stroke bg-white px-5 py-2.5 text-sm font-medium font-inter text-ping-body transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
