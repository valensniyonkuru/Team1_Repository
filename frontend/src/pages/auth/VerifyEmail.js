import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token found.");
      return;
    }

    authAPI
      .verifyEmail({ token })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message || "Verification failed. The token may be invalid or expired."
        );
      });
  }, [token]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-ping-bg px-4 sm:px-6">
      <div className="w-full max-w-[428px] rounded-none sm:rounded-3xl sm:border border-ping-stroke bg-white px-6 py-10 sm:px-8 shadow-sm">
        <div className="flex flex-col items-center gap-8 text-center">
          <img src="/assets/Logo.svg" alt="Ping" className="h-[38px] w-[100px]" />
          
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-poppins text-2xl font-semibold text-ping-heading">
              Email Verification
            </h1>
            
            {status === "loading" && (
              <p className="font-inter text-base font-medium text-ping-body mt-4">
                Verifying your email... please wait.
              </p>
            )}

            {status === "success" && (
              <>
                <p className="font-inter text-base font-medium text-green-600 mt-2">
                  Your email has been successfully verified!
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 w-full rounded-lg bg-ping-dark py-3 font-inter text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-ping-dark/20"
                >
                  Go to Login
                </button>
              </>
            )}

            {status === "error" && (
              <div className="flex flex-col gap-4 w-full">
                <p className="font-inter text-base font-medium text-ping-error-text mt-2">
                  {errorMessage}
                </p>
                <div className="text-sm text-ping-body">
                  Didn't receive the email or token expired?{" "}
                  <Link to="/resend-verification" className="font-medium text-ping-dark hover:underline">
                    Resend link
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
