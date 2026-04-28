"use client";

import { ShieldCheck } from "lucide-react";

type Props = { onCta: () => void };

export default function Navbar({ onCta }: Props) {
  return (
    <header className="glass-cream sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="flex items-center gap-2 text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream">
            <ShieldCheck size={18} strokeWidth={2.2} />
          </span>
          <span className="font-serif text-2xl tracking-tight">DeepGuard</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#how"
            className="text-sm font-medium text-ink/75 transition hover:text-ink"
          >
            How It Works
          </a>
          <a
            href="#models"
            className="text-sm font-medium text-ink/75 transition hover:text-ink"
          >
            Models
          </a>
          <button
            onClick={onCta}
            className="rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-ink-soft"
          >
            Try Now
          </button>
        </div>

        <button
          onClick={onCta}
          className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-cream md:hidden"
        >
          Try Now
        </button>
      </nav>
    </header>
  );
}
