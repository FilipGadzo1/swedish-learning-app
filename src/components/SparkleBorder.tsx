"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { getStoredSparkle, SPARKLE_EVENT } from "@/lib/sparkle";

type EdgeDot = { left: number; top: number; size: number; delay: number; duration: number };

// Scatters dots near the four edges of the parent (which must be
// position: relative) rather than filling it, so it reads as a sparkly
// outline instead of a glow/shadow.
function makeEdgeDots(count: number): EdgeDot[] {
  return Array.from({ length: count }, () => {
    const onHorizontalEdge = Math.random() < 0.5;
    const along = Math.random() * 100;
    const edgeStart = Math.random() < 0.5 ? 0 : 100;
    const jitter = (Math.random() - 0.5) * 8;
    const left = onHorizontalEdge ? along : edgeStart + jitter;
    const top = onHorizontalEdge ? edgeStart + jitter : along;
    return {
      left: Math.min(100, Math.max(0, left)),
      top: Math.min(100, Math.max(0, top)),
      size: 2 + Math.random() * 2.5,
      delay: Math.random() * 2.5,
      duration: 1.1 + Math.random() * 1.5,
    };
  });
}

// Drop into any `relative` element (nav, a card, ...) to give it a sparkly
// dotted outline whenever sparkle mode is on. Renders nothing otherwise.
export default function SparkleBorder({ count = 14 }: { count?: number }) {
  const [enabled, setEnabled] = useState(false);
  const [dots, setDots] = useState<EdgeDot[]>([]);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(getStoredSparkle());
  }, []);

  useEffect(() => {
    // Math.random() must stay out of the render path (it runs server-side
    // too under Cache Components) — generate the layout client-only, once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDots(makeEdgeDots(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onChange(e: Event) {
      setEnabled((e as CustomEvent<boolean>).detail);
    }
    window.addEventListener(SPARKLE_EVENT, onChange);
    return () => window.removeEventListener(SPARKLE_EVENT, onChange);
  }, []);

  if (!enabled) return null;

  return (
    <div className="sparkle-border-layer" aria-hidden>
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
  );
}
