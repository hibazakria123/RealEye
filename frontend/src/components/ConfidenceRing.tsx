"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor?: string;
  label?: string;
  duration?: number;
};

export default function ConfidenceRing({
  value,
  size = 132,
  stroke = 10,
  color,
  trackColor = "rgba(255,255,255,0.12)",
  label,
  duration = 1400,
}: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.max(0, Math.min(100, value));
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Cancel any running animation
    cancelAnimationFrame(rafRef.current);
    setProgress(0);

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke 200ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl text-cream">
          {Math.round(progress)}
          <span className="text-base align-top">%</span>
        </span>
        {label ? (
          <span className="text-[11px] uppercase tracking-[0.18em] text-mute mt-0.5">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
