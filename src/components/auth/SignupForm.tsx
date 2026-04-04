"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { registerUser } from "@/store/slices/authSlice";
import RegisterPayload from "@/types/auth/registerPayload";
import BackgroundStars from "@/components/auth/BackgroundStars";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ColumnTransition from "@/components/auth/ColumnTransition";

export default function SignupForm() {
  const [formData, setFormData] = useState<RegisterPayload & { confirmPassword?: string }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showExit, setShowExit] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const {
    loading: isLoading,
    error,
    user,
  } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const signupCardRef = useRef<HTMLDivElement>(null);
  const formElementsRef = useRef<(HTMLElement | null)[]>([]);

  // Animate card + form elements on mount
  useEffect(() => {
    if (!signupCardRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        signupCardRef.current,
        { opacity: 0, scale: 0.92, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.4)" }
      );

      const formEls = formElementsRef.current.filter(Boolean);
      if (formEls.length > 0) {
        tl.fromTo(
          formEls,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.3"
        );
      }
    }, signupCardRef);

    return () => ctx.revert();
  }, []);

  // Play exit transition on successful registration
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("isAuthTransitioning", "true");
      setShowExit(true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    
    // Omit confirmPassword before sending to API
    const { confirmPassword, ...submitData } = formData;
    dispatch(registerUser(submitData));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const setFormElRef = (index: number) => (el: HTMLElement | null) => {
    formElementsRef.current[index] = el;
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0c3f2c] to-black overflow-hidden">
      <BackgroundStars />
      {showExit && (
        <ColumnTransition
          stayCovered={true}
          onComplete={() => {
            sessionStorage.removeItem("dashboardTransitionPlayed");
            sessionStorage.removeItem("isAuthTransitioning");
            router.push("/dashboard");
          }}
        />
      )}
      <div
        ref={signupCardRef}
        className="w-full max-w-md mx-4 p-8 bg-[rgba(12,63,44,0.4)] border border-[#0c3f2c] rounded-lg backdrop-blur-md shadow-xl z-10"
        style={{ opacity: 0 }}
      >
        <h1
          ref={setFormElRef(1)}
          className="text-4xl tracking-wide font-bold text-white text-center mb-2 mt-6"
        >
          Create Account
        </h1>
        <p
          ref={setFormElRef(2)}
          className="text-center text-gray-300 mb-8"
        >
          Join VeriTrace today
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div ref={setFormElRef(4)}>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-200 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <div ref={setFormElRef(5)}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <div ref={setFormElRef(6)}>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div ref={setFormElRef(7)}>
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
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition pr-10"
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
            ref={setFormElRef(8)}
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-md transition disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p ref={setFormElRef(9)} className="text-center text-gray-300 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-green-400 font-semibold hover:text-green-300 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
