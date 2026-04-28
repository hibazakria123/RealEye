"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import ConfidenceRing from "./ConfidenceRing";
import Waveform from "./Waveform";

export type ModelVote = {
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  prediction: "REAL" | "FAKE";
  confidence: number;
};

export type ResultsData = {
  modelA: ModelVote;
  modelB: ModelVote;
  modelC: ModelVote;
  final: "REAL" | "FAKE";
  avgConf: number;
  agreement: number;
};

type Props = {
  isAnalyzing: boolean;
  results: ResultsData | null;
  onReset: () => void;
};

const RING_REAL = "#5CB85C";
const RING_FAKE = "#E8674C";

function AnalyzingCard({
  icon,
  name,
  subtitle,
  color,
  delay,
}: {
  icon: string;
  name: string;
  subtitle: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="flex flex-col items-center bg-forest-soft p-9 text-text-cream"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <div className="flex w-full items-start justify-between">
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="mt-8 grid h-[132px] w-[132px] place-items-center rounded-full border border-cream/10">
        <Waveform count={5} className="text-cream" />
      </div>
      <h3 className="mt-7 font-display text-3xl">{name}</h3>
      <p
        className="mt-2 text-xs uppercase tracking-[0.18em]"
        style={{ color }}
      >
        {subtitle}
      </p>
      <p className="mt-3 text-xs text-mute">Analyzing…</p>
    </motion.div>
  );
}

function VoteCard({ vote, delay }: { vote: ModelVote; delay: number }) {
  const isReal = vote.prediction === "REAL";
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: delay / 1000,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="flex flex-col items-center bg-forest p-9 text-text-cream"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <div className="flex w-full items-start justify-between">
        <span className="text-3xl">{vote.icon}</span>
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 18,
            delay: delay / 1000 + 0.4,
          }}
          className="rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{
            background: isReal
              ? "rgba(92, 184, 92, 0.18)"
              : "rgba(232, 103, 76, 0.20)",
            color: isReal ? RING_REAL : RING_FAKE,
          }}
        >
          {vote.prediction}
        </motion.span>
      </div>

      <div className="mt-8">
        <ConfidenceRing
          value={vote.confidence}
          color={isReal ? RING_REAL : RING_FAKE}
          label="Confidence"
        />
      </div>

      <h3 className="mt-7 font-display text-3xl">{vote.name}</h3>
      <p
        className="mt-2 text-xs uppercase tracking-[0.18em]"
        style={{ color: vote.color }}
      >
        {vote.subtitle}
      </p>
    </motion.div>
  );
}

export default function Results({ isAnalyzing, results, onReset }: Props) {
  if (!isAnalyzing && !results) return null;

  const placeholders = [
    { icon: "🔬", name: "DeepCNN", subtitle: "12-Layer Deep", color: "var(--color-coral)" },
    { icon: "🎯", name: "FocusCNN", subtitle: "6-Layer Focused", color: "var(--color-lavender)" },
    { icon: "🧬", name: "HybridNet", subtitle: "CNN + ViT", color: "var(--color-marker)" },
  ];

  return (
    <section id="results" className="bg-ink px-6 pb-32 pt-4 text-text-cream">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isAnalyzing
            ? placeholders.map((p, i) => (
                <AnalyzingCard
                  key={p.name}
                  icon={p.icon}
                  name={p.name}
                  subtitle={p.subtitle}
                  color={p.color}
                  delay={i * 200}
                />
              ))
            : results
              ? [results.modelA, results.modelB, results.modelC].map((v, i) => (
                  <VoteCard key={v.name} vote={v} delay={200 + i * 300} />
                ))
              : null}
        </div>

        {results ? <FinalVerdict results={results} onReset={onReset} /> : null}
      </div>
    </section>
  );
}

function FinalVerdict({
  results,
  onReset,
}: {
  results: ResultsData;
  onReset: () => void;
}) {
  const isReal = results.final === "REAL";
  const accent = isReal ? RING_REAL : RING_FAKE;
  const glow = isReal ? "rgba(92,184,92,0.45)" : "rgba(232,103,76,0.55)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="animate-border-glow mx-auto mt-12 max-w-3xl p-[2px]"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}33 50%, ${accent} 100%)`,
        borderRadius: "calc(var(--radius-card) + 2px)",
        ["--glow-color" as string]: glow,
      }}
    >
      <div
        className="bg-ink-soft px-8 py-14 text-center"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-mute">
          Majority Vote — {results.agreement}/3 Models Agree
        </p>

        <h2
          className="mt-5 font-display"
          style={{
            fontSize: "clamp(64px, 11vw, 128px)",
            color: accent,
            lineHeight: 0.95,
          }}
        >
          {results.final}.
        </h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm">
          <span className="text-mute">
            Avg. Confidence:{" "}
            <span className="font-semibold text-text-cream">
              {Math.round(results.avgConf)}%
            </span>
          </span>
          <span className="h-1 w-1 rounded-full bg-mute/60" />
          <span className="text-mute">
            Agreement:{" "}
            <span className="font-semibold text-text-cream">
              {results.agreement}/3
            </span>
          </span>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 1 },
            show: { opacity: 1, transition: { delayChildren: 1.7, staggerChildren: 0.1 } },
          }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
        >
          {[results.modelA, results.modelB, results.modelC].map((v) => (
            <motion.span
              key={v.name}
              variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
              className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-xs font-medium text-text-cream/85"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: v.color }}
              />
              {v.name}
              <span
                className="ml-1 font-semibold"
                style={{ color: v.prediction === "REAL" ? RING_REAL : RING_FAKE }}
              >
                {v.prediction}
              </span>
            </motion.span>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.4 }}
          onClick={onReset}
          className="mt-12 inline-flex items-center gap-2 rounded-pill border-[1.5px] border-text-cream/30 px-6 py-3 text-sm font-medium text-text-cream transition hover:bg-text-cream hover:text-ink"
        >
          <RefreshCw size={15} strokeWidth={2.2} />
          Analyze Another Image
        </motion.button>
      </div>
    </motion.div>
  );
}
