"use client";

import { Upload } from "lucide-react";
import { motion } from "framer-motion";

type Props = { onUpload: () => void; onLearn: () => void };

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function Hero({ onUpload, onLearn }: Props) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-cream pt-32 pb-24 lg:pt-40 lg:pb-32"
    >
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-50" />

      <svg
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -right-32 top-24 h-[420px] w-[420px] opacity-40"
      >
        <circle
          cx="210"
          cy="210"
          r="180"
          fill="none"
          stroke="#0e0e0e"
          strokeWidth="1"
          strokeDasharray="3 9"
        />
        <circle
          cx="210"
          cy="210"
          r="120"
          fill="none"
          stroke="#e8674c"
          strokeWidth="1"
          strokeDasharray="2 8"
          opacity="0.6"
        />
      </svg>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="mb-10 inline-flex items-center gap-2 rounded-pill border border-text-dark/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-text-dark/70"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-coral" />
          3-Model Ensemble
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease }}
          className="font-display"
          style={{
            fontSize: "clamp(48px, 8vw, 144px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
          }}
        >
          See what&rsquo;s
          <br />
          <span style={{ color: "var(--color-coral)" }}>real.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8, ease }}
          className="mt-10 max-w-xl text-base leading-relaxed text-text-dark/75 md:text-lg"
        >
          Three independent AI models analyze every pixel. Majority voting
          delivers the truth with confidence you can measure.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.0, ease }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={onUpload}
            className="glow-lavender inline-flex items-center gap-2.5 rounded-pill bg-lavender px-7 py-3.5 text-sm font-semibold text-text-dark transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload size={17} strokeWidth={2.4} />
            Upload Image
          </button>
          <button
            onClick={onLearn}
            className="inline-flex items-center rounded-pill border-[1.5px] border-text-dark/80 px-7 py-3.5 text-sm font-semibold text-text-dark transition hover:scale-[1.02] hover:bg-text-dark hover:text-cream active:scale-[0.98]"
          >
            Learn More
          </button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 1 },
            show: { opacity: 1, transition: { delayChildren: 1.2, staggerChildren: 0.15 } },
          }}
          className="mt-16 flex items-center gap-6 text-xs uppercase tracking-[0.24em] text-text-dark/55"
        >
          {["DeepCNN", "FocusCNN", "HybridNet"].map((name, i) => (
            <motion.span
              key={name}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="flex items-center gap-6"
            >
              {i > 0 ? <span className="h-px w-8 bg-text-dark/25" /> : null}
              {name}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
