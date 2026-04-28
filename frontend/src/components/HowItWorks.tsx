"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function HowItWorks() {
  return (
    <section id="how" className="bg-cream px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.24em] text-mute-dark">
            The Method
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="font-display"
            style={{ fontSize: "clamp(40px, 6vw, 88px)", lineHeight: 1.0 }}
          >
            How <span style={{ color: "var(--color-coral)" }}>majority voting</span> works
          </motion.h2>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-text-dark/70 md:text-lg">
            Each model votes independently. The majority wins, and confidence
            is weighted — agreeing models count for more, dissenters less.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.18, delayChildren: 0.1 },
            },
          }}
          className="mt-16 bg-ink p-10 text-text-cream md:p-14"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <div className="grid grid-cols-3 gap-6">
            {[
              { name: "Model A", tag: "DeepCNN", color: "var(--color-coral)" },
              { name: "Model B", tag: "FocusCNN", color: "var(--color-lavender)" },
              { name: "Model C", tag: "HybridNet", color: "var(--color-marker)" },
            ].map((m) => (
              <motion.div
                key={m.name}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="bg-forest px-4 py-6 text-center"
                style={{ borderRadius: 20 }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: m.color }}
                >
                  {m.tag}
                </p>
                <p className="mt-2 font-display text-2xl">{m.name}</p>
              </motion.div>
            ))}
          </div>

          <motion.svg
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.7 } },
            }}
            viewBox="0 0 600 200"
            className="mt-6 w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M100 0 Q 100 80 300 100"
              stroke="rgba(239,231,210,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <path
              d="M300 0 L 300 100"
              stroke="rgba(239,231,210,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <path
              d="M500 0 Q 500 80 300 100"
              stroke="rgba(239,231,210,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <circle cx="300" cy="100" r="22" fill="#E8674C" opacity="0.22" />
            <circle cx="300" cy="100" r="9" fill="#E8674C" />
            <path
              d="M300 110 L 300 180"
              stroke="rgba(239,231,210,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <path
              d="M294 174 L 300 184 L 306 174"
              stroke="rgba(239,231,210,0.6)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="mx-auto mt-2 max-w-md border-[1.5px] border-lavender bg-lavender/10 px-6 py-5 text-center"
            style={{ borderRadius: 20 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lavender">
              Majority Vote
            </p>
            <p className="mt-2 font-display text-xl text-text-cream">
              Final Verdict + Weighted Confidence
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
