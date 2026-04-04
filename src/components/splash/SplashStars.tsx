"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function SplashStars() {
  const starsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    starsRef.current.forEach((star, i) => {
      if (star) {
        gsap.to(star, {
          y: i % 2 === 0 ? -12 : -8,
          x: i % 3 === 0 ? 5 : -5,
          repeat: -1,
          yoyo: true,
          duration: 2.5 + i * 0.7,
          ease: "sine.inOut",
        });
      }
    });
  }, []);

  return (
    <>
      <div
        ref={(el) => {
          starsRef.current[0] = el;
        }}
        className="absolute top-60 left-60 w-10 h-10 text-white opacity-25 pointer-events-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 11C6.52285 11 11 6.52285 11 1H13C13 6.52285 17.4772 11 23 11V13C17.4772 13 13 17.4772 13 23H11C11 17.4772 6.52285 13 1 13V11Z"></path>
        </svg>
      </div>

      <div
        ref={(el) => {
          starsRef.current[1] = el;
        }}
        className="absolute top-35 right-130 w-18 h-18 text-white opacity-15 pointer-events-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 11C6.52285 11 11 6.52285 11 1H13C13 6.52285 17.4772 11 23 11V13C17.4772 13 13 17.4772 13 23H11C11 17.4772 6.52285 13 1 13V11Z"></path>
        </svg>
      </div>

      <div
        ref={(el) => {
          starsRef.current[2] = el;
        }}
        className="absolute bottom-40 left-110 w-6 h-6 text-white opacity-20 pointer-events-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 11C6.52285 11 11 6.52285 11 1H13C13 6.52285 17.4772 11 23 11V13C17.4772 13 13 17.4772 13 23H11C11 17.4772 6.52285 13 1 13V11Z"></path>
        </svg>
      </div>

      <div
        ref={(el) => {
          starsRef.current[3] = el;
        }}
        className="absolute bottom-80 right-86 w-8 h-8 text-white opacity-30 pointer-events-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 11C6.52285 11 11 6.52285 11 1H13C13 6.52285 17.4772 11 23 11V13C17.4772 13 13 17.4772 13 23H11C11 17.4772 6.52285 13 1 13V11Z"></path>
        </svg>
      </div>
    </>
  );
}
