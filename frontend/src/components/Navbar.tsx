"use client";

import { Eye, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

type Props = { onCta: () => void };

export default function Navbar({ onCta }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-1/2 top-4 z-50 -translate-x-1/2 px-4"
    >
      <nav className="nav-pill flex items-center gap-3 rounded-pill px-3 py-2 sm:gap-6 sm:px-4">
        <a
          href="#top"
          className="flex items-center gap-2 px-2 text-text-dark"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-text-dark text-cream">
            <Eye size={14} strokeWidth={2.4} />
          </span>
          <span className="font-sans text-base font-semibold tracking-tight">
            RealEye
          </span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          <a href="#how" className="nav-link text-sm font-medium text-text-dark/85">
            How It Works
          </a>
          <a href="#models" className="nav-link text-sm font-medium text-text-dark/85">
            Models
          </a>
        </div>

        <button
          onClick={onCta}
          className="hidden items-center rounded-pill bg-lavender px-5 py-2 text-sm font-semibold text-text-dark transition hover:scale-[1.02] active:scale-[0.98] md:inline-flex"
        >
          Try Now
        </button>

        <button
          onClick={onCta}
          className="rounded-pill bg-lavender px-4 py-2 text-sm font-semibold text-text-dark md:hidden"
        >
          Try Now
        </button>

        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-full text-text-dark md:hidden"
        >
          <Menu size={18} />
        </button>
      </nav>

      {open ? (
        <div className="nav-pill mx-auto mt-2 flex flex-col gap-3 rounded-3xl px-6 py-4 text-sm md:hidden">
          <a href="#how" onClick={() => setOpen(false)} className="text-text-dark/85">
            How It Works
          </a>
          <a href="#models" onClick={() => setOpen(false)} className="text-text-dark/85">
            Models
          </a>
        </div>
      ) : null}
    </motion.header>
  );
}
