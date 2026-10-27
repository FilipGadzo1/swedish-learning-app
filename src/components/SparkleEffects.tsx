"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getStoredSparkle, SPARKLE_EVENT } from "@/lib/sparkle";

const AMBIENT_COUNT = 70;
const TRAIL_THROTTLE_MS = 20;
const TRAIL_PARTICLE_LIFETIME_MS = 700;

type Dot = { left: number; top: number; size: number; delay: number; duration: number };

function makeDots(count: number): Dot[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 4,
  }));
}

// Mounted once in the root layout. Renders the ambient background twinkle and
// the cursor sparkle trail; both are no-ops whenever sparkle mode is off.
export default function SparkleEffects() {
  const [enabled, setEnabled] = useState(false);
  const [dots, setDots] = useState<Dot[]>([]);
  const trailRef = useRef<HTMLDivElement>(null);
  const lastSpawn = useRef(0);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(getStoredSparkle());
  }, []);

  useEffect(() => {
    // Math.random() must stay out of the render path (it runs server-side
    // too under Cache Components) — generate the layout client-only, once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDots(makeDots(AMBIENT_COUNT));
  }, []);

  useEffect(() => {
    function onChange(e: Event) {
      setEnabled((e as CustomEvent<boolean>).detail);
    }
    window.addEventListener(SPARKLE_EVENT, onChange);
    return () => window.removeEventListener(SPARKLE_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSpawn.current < TRAIL_THROTTLE_MS) return;
      lastSpawn.current = now;

      const particle = document.createElement("span");
      particle.className = "sparkle-particle";
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      trailRef.current?.appendChild(particle);
      window.setTimeout(() => particle.remove(), TRAIL_PARTICLE_LIFETIME_MS);
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled]);

  return (
    <>
      {enabled && (
        <div className="sparkle-ambient-layer" aria-hidden>
          {dots.map((d, i) => (
            <span
              key={i}
              className="sparkle-dot"
              style={{
                left: `${d.left}%`,
                top: `${d.top}%`,
                width: `${d.size}px`,
                height: `${d.size}px`,
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.duration}s`,
              }}
            />
          ))}
        </div>
      )}
      <div ref={trailRef} className="sparkle-trail-layer" aria-hidden />
    </>
  );
}
