"use client";

type Props = { count?: number; className?: string };

export default function Waveform({ count = 5, className = "" }: Props) {
  return (
    <span className={`inline-flex items-end gap-[3px] ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="wave-bar"
          style={{
            animationDelay: `${i * 0.12}s`,
            height: `${10 + (i % 3) * 6}px`,
          }}
        />
      ))}
    </span>
  );
}
