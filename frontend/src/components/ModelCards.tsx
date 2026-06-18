"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const cards = [
  {
    icon: "🔬",
    title: "DeepCNN",
    accent: "12-Layer Deep Analysis",
    accentColor: "#E8773A",
    body:
      "Trained on thousands of real and fake images to catch hidden patterns the human eye misses.",
  },
  {
    icon: "🎯",
    title: "FocusCNN",
    accent: "6-Layer Focused Analysis",
    accentColor: "#C9A5E8",
    body:
      "Fast and lightweight & built to catch the most obvious signs of a fake face quickly and accurately.",
  },
  {
    icon: "🧬",
    title: "HybridNet",
    accent: "CNN + Vision Transformer",
    accentColor: "#5CB85C",
    body:
      "Combines two AI techniques to see both fine details and the big picture not just individual pixels",
  },
];

export default function ModelCards() {
  return (
    <section
      id="models"
      className="bg-cream px-6 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.22em] text-mute-dark">
            The Ensemble
          </span>
          <h2 className="font-serif text-4xl leading-tight text-ink md:text-5xl lg:text-6xl">
            Three models. <span className="italic">One truth.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ink/70 md:text-lg">
            We don't rely on one opinion. Three AI models analyze your image and vote
            independently & the majority wins.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col overflow-hidden rounded-card bg-teal p-8 text-cream shadow-[0_24px_60px_-30px_rgba(43,79,68,0.55)] transition hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{c.icon}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 text-cream transition group-hover:bg-orange group-hover:text-cream">
                  <ArrowUpRight size={16} strokeWidth={2.4} />
                </span>
              </div>

              <h3 className="mt-10 font-serif text-3xl leading-tight">
                {c.title}
              </h3>

              <p
                className="mt-2 text-sm font-medium uppercase tracking-[0.16em]"
                style={{ color: c.accentColor }}
              >
                {c.accent}
              </p>

              <p className="mt-6 text-[15px] leading-relaxed text-cream/80">
                {c.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
