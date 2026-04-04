"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function BackgroundStars() {
  const starsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    starsRef.current.forEach((star, i) => {
      if (star) {
        gsap.to(star, {
          y: -20,
          repeat: -1,
          yoyo: true,
          duration: 2 + i * 0.5,
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
        className="absolute top-20 left-20 w-8 h-8 text-white opacity-20 pointer-events-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 11C6.52285 11 11 6.52285 11 1H13C13 6.52285 17.4772 11 23 11V13C17.4772 13 13 17.4772 13 23H11C11 17.4772 6.52285 13 1 13V11Z"></path>
        </svg>
      </div>
      <div
        ref={(el) => {
          starsRef.current[1] = el;
        }}
        className="absolute bottom-32 right-16 w-12 h-12 text-white opacity-15 pointer-events-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 11C6.52285 11 11 6.52285 11 1H13C13 6.52285 17.4772 11 23 11V13C17.4772 13 13 17.4772 13 23H11C11 17.4772 6.52285 13 1 13V11Z"></path>
        </svg>
      </div>
      <div
        ref={(el) => {
          starsRef.current[2] = el;
        }}
        className="absolute top-1/3 right-1/4 w-6 h-6 text-white opacity-10 pointer-events-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 11C6.52285 11 11 6.52285 11 1H13C13 6.52285 17.4772 11 23 11V13C17.4772 13 13 17.4772 13 23H11C11 17.4772 6.52285 13 1 13V11Z"></path>
        </svg>
      </div>
    </>
  );
}
