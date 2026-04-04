"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { loginUser, clearError } from "@/store/slices/authSlice";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ColumnTransition from "@/components/auth/ColumnTransition";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showExit, setShowExit] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const {
    loading: isLoading,
    error,
    user,
  } = useSelector((state: RootState) => state.auth);

  const loginCardRef = useRef<HTMLDivElement>(null);
  const formElementsRef = useRef<(HTMLElement | null)[]>([]);
  const router = useRouter();

  // Clear any existing auth errors when the component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Animate card + form elements on mount
  useEffect(() => {
    if (!loginCardRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        loginCardRef.current,
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
    }, loginCardRef);

    return () => ctx.revert();
  }, []);

  // Play exit transition on successful login
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("isAuthTransitioning", "true");
      setShowExit(true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const setFormElRef = (index: number) => (el: HTMLElement | null) => {
    formElementsRef.current[index] = el;
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
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
        ref={loginCardRef}
        className="w-full max-w-md mx-4 p-8 bg-[rgba(12,63,44,0.4)] border border-[#0c3f2c] rounded-lg backdrop-blur-md shadow-xl"
        style={{ opacity: 0 }}
      >
        <h1
          ref={setFormElRef(1)}
          className="text-4xl tracking-wide font-bold text-white text-center mb-2 mt-6"
        >
          Welcome Back
        </h1>
        <p
          ref={setFormElRef(2)}
          className="text-center text-gray-300 mb-8"
        >
          Sign in to your account
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div ref={setFormElRef(3)}>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div ref={setFormElRef(4)} className="relative">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 bg-[rgba(12,63,44,0.3)] border border-[#0c3f2c] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-10"
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

          <div
            ref={setFormElRef(5)}
            className="flex items-center justify-end text-sm"
          >
            <Link
              href="/forgot-password"
              className="text-green-400 hover:text-green-300 transition"
            >
              Forgot password?
            </Link>
          </div>

          <button
            ref={setFormElRef(6)}
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div ref={setFormElRef(7)} className="my-6 flex items-center">
          <div className="flex-1 border-t border-[#0c3f2c]"></div>
          <span className="px-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-[#0c3f2c]"></div>
        </div>

        <p ref={setFormElRef(8)} className="text-center text-gray-300">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-green-400 font-semibold hover:text-green-300 transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
