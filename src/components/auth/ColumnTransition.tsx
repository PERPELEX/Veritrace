"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const NUM_COLUMNS = 8;

interface ColumnTransitionProps {
  onComplete: () => void;
  startCovered?: boolean;
  stayCovered?: boolean;
}

export default function ColumnTransition({ onComplete, startCovered, stayCovered }: ColumnTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const columns = gsap.utils.toArray<HTMLElement>(".col-overlay");
      const masterTimeline = gsap.timeline();

      if (!startCovered) {
        // Phase 1: Columns drop in from top, staggered left to right
        masterTimeline.fromTo(
          columns,
          {
            yPercent: -100,
            scaleY: 1.1,
            scaleX: 1.05,
          },
          {
            yPercent: 0,
            scaleY: 1,
            scaleX: 1.05,
            duration: 0.5,
            stagger: 0.07,
            ease: "power3.out",
          }
        );
      } else {
        // Just ensure they start fully covered
        gsap.set(columns, { yPercent: 0, scaleY: 1, scaleX: 1.05 });
      }

      // Phase 2: Columns "breathe" with a subtle pulse
      masterTimeline.to(columns, {
        scaleX: 1.1,
        duration: 0.12,
        ease: "sine.inOut",
        stagger: 0.02,
      });

      masterTimeline.to(columns, {
        scaleX: 1.05,
        duration: 0.12,
        ease: "sine.inOut",
        stagger: 0.02,
      });

      // Phase 3: Columns slide down and off screen, from center outward
      if (!stayCovered) {
        masterTimeline.to(columns, {
          yPercent: 100,
          duration: 0.35,
          stagger: {
            each: 0.03,
            from: "center",
          },
          ease: "power4.in",
          onComplete: () => {
            onComplete();
          },
        });
      } else {
        // If we want to stay covered, we fire onComplete immediately after the breathing phase
        masterTimeline.call(() => {
          onComplete();
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete, startCovered, stayCovered]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex pointer-events-none">
      {[...Array(NUM_COLUMNS)].map((_, i) => (
        <div
          key={i}
          className="col-overlay h-full"
          style={{
            width: `${100 / NUM_COLUMNS}%`,
            background: `linear-gradient(180deg, 
              hsl(${155 + i * 3}, 70%, ${10 + i * 2}%) 0%, 
              hsl(${155 + i * 3}, 60%, ${5 + i}%) 100%)`,
            boxShadow:
              "inset 1px 0 0 rgba(255,255,255,0.04), inset -1px 0 0 rgba(255,255,255,0.04)",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
