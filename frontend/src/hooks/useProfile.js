import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { accountAPI, postAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function useProfile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Change-password form
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSubmitting, setPwSubmitting] = useState(false);

  // Change-email form
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [emailErrors, setEmailErrors] = useState({});
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  // Delete-account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await accountAPI.getMe();
      const data = res.data?.data || res.data;
      setProfile(data);
    } catch {
      showToast("Failed to load profile.", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [showToast]);

  const fetchPostCount = useCallback(async () => {
    try {
      // Fetch enough posts to count the user's own. The API returns paged data;
      // we request a large page to approximate (accurate for most users).
      const res = await postAPI.getAll(0, 200);
      const payload = res.data?.data || res.data;
      const posts = payload?.content ?? [];
      const count = posts.filter((p) => p.authorName === user?.name).length;
      setPostCount(count);
    } catch {
      // non-critical — leave at 0
    }
  }, [user?.name]);

  useEffect(() => {
    fetchProfile();
    fetchPostCount();
  }, [fetchProfile, fetchPostCount]);

  // ── Change Password ──────────────────────────────────────
  const validatePw = () => {
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = "Current password is required.";
    if (!pwForm.newPassword) errs.newPassword = "New password is required.";
    else if (pwForm.newPassword.length < 8 || pwForm.newPassword.length > 12)
      errs.newPassword = "Password must be 8–12 characters.";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(pwForm.newPassword))
      errs.newPassword = "Must include uppercase, lowercase, number, and special character.";
    if (!pwForm.confirmPassword) errs.confirmPassword = "Please confirm your new password.";
    else if (pwForm.confirmPassword !== pwForm.newPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwSubmitting(true);
    try {
      await accountAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToast("Password changed. Please log in again.", "success");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await logout();
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to change password.";
      setPwErrors({ api: message });
    } finally {
      setPwSubmitting(false);
    }
  };

  // ── Change Email ─────────────────────────────────────────
  const validateEmail = () => {
    const errs = {};
    if (!emailForm.newEmail) errs.newEmail = "New email is required.";
    else if (!/\S+@\S+\.\S+/.test(emailForm.newEmail)) errs.newEmail = "Enter a valid email.";
    if (!emailForm.password) errs.password = "Password is required.";
    return errs;
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    const errs = validateEmail();
    if (Object.keys(errs).length > 0) { setEmailErrors(errs); return; }
    setEmailErrors({});
    setEmailSubmitting(true);
    try {
      await accountAPI.changeEmail(emailForm);
      showToast("Email changed. Please verify your new email and log in again.", "success");
      setEmailForm({ newEmail: "", password: "" });
      await logout();
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to change email.";
      setEmailErrors({ api: message });
    } finally {
      setEmailSubmitting(false);
    }
  };

  // ── Delete Account ───────────────────────────────────────
  const handleDeleteAccount = async () => {
    setDeleteSubmitting(true);
    try {
      await accountAPI.deleteAccount();
      showToast("Account deleted.", "success");
      await logout();
      navigate("/register");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete account.";
      showToast(message, "error");
    } finally {
      setDeleteSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  return {
    profile,
    postCount,
    loadingProfile,
    // password
    pwForm, setPwForm, pwErrors, pwSubmitting, handleChangePassword,
    // email
    emailForm, setEmailForm, emailErrors, emailSubmitting, handleChangeEmail,
    // delete
    showDeleteConfirm, setShowDeleteConfirm, deleteSubmitting, handleDeleteAccount,
  };
}
