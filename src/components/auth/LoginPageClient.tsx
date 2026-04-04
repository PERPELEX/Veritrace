"use client";

import { useState, useCallback, useEffect } from "react";
import SplashScreen from "@/components/splash/SplashScreen";
import ColumnTransition from "@/components/auth/ColumnTransition";
import LoginForm from "@/components/auth/LoginForm";
import BackgroundStars from "@/components/auth/BackgroundStars";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

type Phase = "splash" | "transition" | "login";

export default function LoginPageClient() {
  const [phase, setPhase] = useState<Phase | null>(null);

  // Initialize phase from sessionStorage once on mount
  useEffect(() => {
    const hasShown = sessionStorage.getItem("hasShownSplash");
    if (hasShown) {
      setPhase("login");
    } else {
      setPhase("splash");
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    setPhase("transition");
  }, []);

  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const handleTransitionComplete = useCallback(() => {
    sessionStorage.setItem("hasShownSplash", "true");
    if (user) {
      sessionStorage.removeItem("dashboardTransitionPlayed");
      router.push("/dashboard");
    } else {
      setPhase("login");
      sessionStorage.setItem("dashboardTransitionPlayed", "true");
    }
  }, [user, router]);

  if (phase === null) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0c3f2c] to-black overflow-hidden">
      {/* Decorative stars — always visible behind everything */}
      <BackgroundStars />

      {/* Phase 1: Splash Screen */}
      {phase === "splash" && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* Phase 2: Column Transition (overlays on top) */}
      {phase === "transition" && (
        <ColumnTransition stayCovered={!!user} onComplete={handleTransitionComplete} />
      )}

      {/* Phase 3: Login Form */}
      {phase === "login" && <LoginForm />}
    </div>
  );
}
