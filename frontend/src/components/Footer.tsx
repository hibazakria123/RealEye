"use client";

import { Eye } from "lucide-react";
import { motion } from "framer-motion";

const tags = ["CNN", "ViT", "PyTorch"];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8 }}
      className="bg-ink text-text-cream"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-16 md:flex-row md:items-end md:justify-between">
        <div>
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-text-cream/10">
              <Eye size={16} strokeWidth={2.4} />
            </span>
            <span className="font-display text-2xl">RealEye</span>
          </a>
          <p className="mt-3 max-w-xs text-sm text-text-body-dark/85">
            <span className="italic">See what&rsquo;s real.</span>
          </p>
        </div>

        <div className="text-center">
          <p className="font-display text-sm italic text-mute">Project</p>
          <p className="mt-2 text-sm text-text-cream/85">
            RealEye — FYP Project — Lahore Garrison University — 2026
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="font-display text-sm italic text-mute">Stack</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-end">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-pill border border-text-cream/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-text-cream/85"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
