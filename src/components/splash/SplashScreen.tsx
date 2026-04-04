"use client";

import Image from "next/image";
import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import SplashStars from "@/components/splash/SplashStars";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const skippedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSkip = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => onComplete(), 0);
  }, [onComplete]);

  // 5-second auto-advance
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      handleSkip();
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleSkip]);

  // GSAP animations
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out" }
    );
  }, []);

  // Skip on keydown / touchstart
  useEffect(() => {
    const handler = () => handleSkip();
    window.addEventListener("keydown", handler);
    window.addEventListener("touchstart", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, [handleSkip]);

  return (
    <div
      className="relative flex items-center justify-center h-screen bg-gradient-to-br from-[#0c3f2c] to-black overflow-hidden cursor-pointer"
      onClick={handleSkip}
      role="button"
      tabIndex={0}
    >
      <SplashStars />

      <div ref={logoRef} className="flex flex-col items-center">
        <Image
          src="/splash/s1.png"
          width={400}
          height={120}
          alt="VeriTrace"
          priority
        />
      </div>
    </div>
  );
}
