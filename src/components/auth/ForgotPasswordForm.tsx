"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  sendForgotPasswordOtp,
  verifyResetOtp,
  resetPassword,
  clearOtpState,
  clearOtpError,
} from "@/store/slices/otpSlice";
import BackgroundStars from "@/components/auth/BackgroundStars";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ForgotPasswordForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { email, step, loading, error, successMessage } = useSelector(
    (state: RootState) => state.otp
  );

  const [inputEmail, setInputEmail] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const forgotCardRef = useRef<HTMLDivElement>(null);
  const formElementsRef = useRef<(HTMLElement | null)[]>([]);

  // Initial card entrance animation
  useEffect(() => {
    if (!forgotCardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        forgotCardRef.current,
        { opacity: 0, scale: 0.92, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.4)" }
      );
    }, forgotCardRef);

    return () => ctx.revert();
  }, []);

  // Animate form elements whenever the "step" changes
  useEffect(() => {
    const ctx = gsap.context(() => {
      const formEls = formElementsRef.current.filter(Boolean);
      if (formEls.length > 0) {
        gsap.fromTo(
          formEls,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.05,
            ease: "power2.out",
            delay: 0.1,
          }
        );
      }
    }, forgotCardRef);

    formElementsRef.current = [];

    return () => ctx.revert();
  }, [step]);

  useEffect(() => {
    dispatch(clearOtpState());
    return () => {
      dispatch(clearOtpState());
    };
  }, [dispatch]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(sendForgotPasswordOtp(inputEmail));
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      dispatch(verifyResetOtp({ email, otp: inputOtp }));
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    if (email) {
      dispatch(resetPassword({ email, otp: inputOtp, newPassword }));
    }
  };

  const setFormElRef = (index: number) => (el: HTMLElement | null) => {
    formElementsRef.current[index] = el;
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0c3f2c] to-black overflow-hidden">
      <BackgroundStars />
      <div
        ref={forgotCardRef}
        className="w-full max-w-md mx-4 p-8 bg-[rgba(12,63,44,0.4)] border border-[#0c3f2c] rounded-lg backdrop-blur-md shadow-xl transition-all duration-300 z-10"
        style={{ opacity: 0 }}
      >
        <h1
          ref={setFormElRef(1)}
          className="text-3xl tracking-wide font-bold text-white text-center mb-2 mt-6"
        >
          {step === "email" && "Reset Password"}
          {step === "otp" && "Verify Email"}
          {step === "reset" && "New Password"}
        </h1>
        <p
          ref={setFormElRef(2)}
          className="text-center text-gray-300 mb-8"
        >
          {step === "email" && "Enter your email to receive a code"}
          {step === "otp" && `We sent a code to ${email}`}
          {step === "reset" && "Enter your new password below"}
        </p>

        {error && (
          <div
            ref={setFormElRef(3)}
            className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300 text-sm"
          >
            {error}
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300 text-sm">
            {passwordError}
          </div>
        )}

        {successMessage && step !== "reset" && !error && (
          <div
            ref={setFormElRef(4)}
            className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-300 text-sm"
          >
            {successMessage}
          </div>
        )}

        {/* --- STEP 1: EMAIL ENTRY --- */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div ref={setFormElRef(5)}>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                value={inputEmail}
                onChange={(e) => {
                  setInputEmail(e.target.value);
                  dispatch(clearOtpError());
                }}
                required
                className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="you@example.com"
              />
            </div>
            <button
              ref={setFormElRef(6)}
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-md transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* --- STEP 2: OTP ENTRY --- */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div ref={setFormElRef(5)}>
              <label
                htmlFor="forgot-otp"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                6-Digit Code
              </label>
              <input
                id="forgot-otp"
                type="text"
                maxLength={6}
                value={inputOtp}
                onChange={(e) => {
                  setInputOtp(e.target.value);
                  dispatch(clearOtpError());
                }}
                required
                className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-center text-xl tracking-widest"
                placeholder="000000"
              />
            </div>
            <button
              ref={setFormElRef(6)}
              type="submit"
              disabled={loading || inputOtp.length < 6}
              className="w-full py-2 px-4 mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-md transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {/* --- STEP 3: RESET DIALOG --- */}
        {step === "reset" && (
          <>
            {successMessage === "Password changed successfully" ? (
              <div ref={setFormElRef(5)} className="text-center">
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-300">
                  Your password has been reset successfully!
                </div>
                <Link
                  href="/login"
                  className="inline-block w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-md transition text-center"
                >
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div ref={setFormElRef(5)}>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        dispatch(clearOtpError());
                      }}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Must be at least 6 characters long.
                  </p>
                </div>
                
                <div ref={setFormElRef(6)}>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        dispatch(clearOtpError());
                      }}
                      required
                      className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  ref={setFormElRef(7)}
                  type="submit"
                  disabled={loading || newPassword.length < 6}
                  className="w-full py-2 px-4 mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-md transition disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </>
        )}

        {/* Back to Login Link */}
        {step !== "reset" && (
          <p ref={setFormElRef(8)} className="text-center text-gray-300 mt-6">
            <Link
              href="/login"
              className="text-green-400 font-semibold hover:text-green-300 transition"
            >
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
