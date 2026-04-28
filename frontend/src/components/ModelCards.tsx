"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const cards = [
  {
    icon: "🔬",
    title: "DeepCNN",
    accent: "12-Layer Deep Analysis",
    accentColor: "var(--color-coral)",
    body:
      "Stacked convolutional blocks dissect texture, lighting, and pixel-level artifacts with batch-normalized precision.",
  },
  {
    icon: "🎯",
    title: "FocusCNN",
    accent: "6-Layer Focused Analysis",
    accentColor: "var(--color-lavender)",
    body:
      "A lean network with adaptive pooling — fast, lightweight, and tuned to spot the obvious tells of synthetic faces.",
  },
  {
    icon: "🧬",
    title: "HybridNet",
    accent: "CNN + Vision Transformer",
    accentColor: "var(--color-marker)",
    body:
      "Vision Transformer features paired with a custom head capture global structure that pure CNNs tend to miss.",
  },
];

export default function ModelCards() {
  return (
    <section id="models" className="bg-cream px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.24em] text-mute-dark">
            The Ensemble
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-display"
            style={{
              fontSize: "clamp(40px, 6vw, 88px)",
              lineHeight: 1.0,
            }}
          >
            Three models. One <span style={{ color: "var(--color-coral)" }}>truth.</span>
          </motion.h2>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-text-dark/70 md:text-lg">
            No single model is infallible. Three independent architectures vote
            on every image — disagreement is a signal, not a flaw.
          </p>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.65,
                delay: i * 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col overflow-hidden bg-forest p-9 text-text-cream transition-shadow duration-300 hover:shadow-[0_30px_70px_-30px_rgba(28,58,53,0.6)]"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{c.icon}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 text-text-cream transition group-hover:bg-cream group-hover:text-forest">
                  <ArrowUpRight size={16} strokeWidth={2.4} />
                </span>
              </div>

              <h3 className="mt-12 font-display text-4xl">{c.title}</h3>

              <p
                className="mt-2 text-sm font-medium uppercase tracking-[0.18em]"
                style={{ color: c.accentColor }}
              >
                {c.accent}
              </p>

              <p className="mt-7 text-[15px] leading-relaxed text-text-body-dark/95">
                {c.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
