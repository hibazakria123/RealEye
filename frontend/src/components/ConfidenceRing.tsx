"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(target * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    setProgress(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
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
        <span className="font-display text-4xl text-text-cream">
          {Math.round(progress)}
          <span className="font-sans text-base align-top not-italic">%</span>
        </span>
        {label ? (
          <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-mute">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
