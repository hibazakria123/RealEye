"use client";

import { ShieldCheck } from "lucide-react";

const tags = ["CNN", "ViT", "PyTorch"];

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-12 md:flex-row md:justify-between md:py-10">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/10">
            <ShieldCheck size={18} strokeWidth={2.2} />
          </span>
          <span className="font-serif text-xl">DeepGuard</span>
        </a>

        <p className="text-center text-xs uppercase tracking-[0.22em] text-mute">
          FYP Project — Lahore Garrison University — 2026
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-pill border border-cream/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cream/80"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
