import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResendVerification from "./pages/auth/ResendVerification";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import PostDetails from "./pages/PostDetails";
import Analytics from "./pages/Analytics";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-ping-bg px-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-ping-heading mb-2">Something went wrong</h1>
            <p className="text-ping-body mb-4">An unexpected error occurred.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }}
              className="rounded-lg bg-ping-dark px-5 py-2.5 text-sm font-medium text-white"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/posts/:id" element={<PostDetails />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/resend-verification" element={<ResendVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
