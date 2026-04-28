"use client";

import { Upload } from "lucide-react";

type Props = { onUpload: () => void };

export default function Hero({ onUpload }: Props) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ink text-cream"
    >
      <div className="dot-grid absolute inset-0 opacity-60" />

      <svg
        aria-hidden
        className="animate-float-slower pointer-events-none absolute -left-24 top-32 h-[420px] w-[420px] opacity-30"
      >
        <circle
          cx="210"
          cy="210"
          r="180"
          fill="none"
          stroke="#e8773a"
          strokeWidth="1"
          strokeDasharray="4 8"
          opacity="0.45"
        />
        <circle
          cx="210"
          cy="210"
          r="120"
          fill="none"
          stroke="#faf5ed"
          strokeWidth="1"
          strokeDasharray="2 6"
          opacity="0.25"
        />
      </svg>

      <svg
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -right-32 bottom-10 h-[380px] w-[380px] opacity-25"
      >
        <circle
          cx="190"
          cy="190"
          r="160"
          fill="none"
          stroke="#faf5ed"
          strokeWidth="1"
          strokeDasharray="3 9"
        />
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {[
          [12, 22],
          [78, 18],
          [22, 70],
          [88, 62],
          [55, 86],
          [40, 30],
        ].map(([x, y], i) => (
          <span
            key={i}
            className="animate-float-slow absolute h-1.5 w-1.5 rounded-full bg-orange/70"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${i * 0.6}s`,
              opacity: 0.45,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-32 text-center lg:pt-32 lg:pb-40">
        <span className="mb-8 inline-flex items-center gap-2 rounded-pill border border-orange/30 bg-orange/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-orange">
          <span className="h-1.5 w-1.5 rounded-full bg-orange" />
          3-Model Ensemble Detection
        </span>

        <h1 className="font-serif text-5xl leading-[1.05] sm:text-6xl md:text-7xl lg:text-[88px]">
          Don&rsquo;t guess,
          <br />
          <span className="italic text-orange">detect.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-mute md:text-lg">
          Three independent AI models analyze every pixel. Majority voting
          delivers the truth with confidence you can measure.
        </p>

        <button
          onClick={onUpload}
          className="glow-orange mt-10 inline-flex items-center gap-2.5 rounded-pill bg-orange px-7 py-4 text-sm font-semibold text-cream transition hover:bg-orange-soft"
        >
          <Upload size={18} strokeWidth={2.4} />
          Upload Image
        </button>

        <div className="mt-14 flex items-center gap-6 text-xs uppercase tracking-[0.22em] text-mute">
          <span>DeepCNN</span>
          <span className="h-px w-8 bg-mute/40" />
          <span>FocusCNN</span>
          <span className="h-px w-8 bg-mute/40" />
          <span>HybridNet</span>
        </div>
      </div>
    </section>
  );
}
