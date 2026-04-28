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

const AnalyzingCard = ({ icon, name, subtitle, color, delay }: { icon: string; name: string; subtitle: string; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay / 1000 }}
    className="flex flex-col items-center rounded-card bg-teal-deep p-8 text-cream"
  >
    <div className="flex w-full items-start justify-between">
      <span className="text-3xl">{icon}</span>
    </div>
    <div className="mt-8 grid h-[132px] w-[132px] place-items-center rounded-full border border-cream/10">
      <Waveform count={5} className="text-cream" />
    </div>
    <h3 className="mt-6 font-serif text-2xl">{name}</h3>
    <p className="mt-1 text-xs uppercase tracking-[0.18em]" style={{ color }}>{subtitle}</p>
    <p className="mt-3 text-xs text-mute">Analyzing…</p>
  </motion.div>
);

const VoteCard = ({ vote, delay }: { vote: ModelVote; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center rounded-card bg-teal p-8 text-cream"
  >
    <div className="flex w-full items-start justify-between">
      <span className="text-3xl">{vote.icon}</span>
      <span
        className={`rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
          vote.prediction === "REAL"
            ? "bg-success/15 text-success"
            : "bg-danger/15 text-danger"
        }`}
      >
        {vote.prediction}
      </span>
    </div>

    <div className="mt-6">
      <ConfidenceRing
        value={vote.confidence}
        color={vote.prediction === "REAL" ? "#5CB85C" : "#E25C5C"}
        label="Confidence"
      />
    </div>

    <h3 className="mt-6 font-serif text-2xl">{vote.name}</h3>
    <p
      className="mt-1 text-xs uppercase tracking-[0.18em]"
      style={{ color: vote.color }}
    >
      {vote.subtitle}
    </p>
  </motion.div>
);

export default function Results({ isAnalyzing, results, onReset }: Props) {
  if (!isAnalyzing && !results) return null;

  const placeholders = [
    { icon: "🔬", name: "DeepCNN", subtitle: "12-Layer Deep", color: "#E8773A" },
    { icon: "🎯", name: "FocusCNN", subtitle: "6-Layer Focused", color: "#C9A5E8" },
    { icon: "🧬", name: "HybridNet", subtitle: "CNN + ViT", color: "#5CB85C" },
  ];

  return (
    <section id="results" className="bg-ink px-6 pb-32 pt-4 text-cream">
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
                  <VoteCard key={v.name} vote={v} delay={200 + i * 600} />
                ))
              : null}
        </div>

        {results ? <FinalVerdict results={results} onReset={onReset} /> : null}
      </div>
    </section>
  );
}

function FinalVerdict({ results, onReset }: { results: ResultsData; onReset: () => void }) {
  const isReal = results.final === "REAL";
  const accent = isReal ? "#5CB85C" : "#E25C5C";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 rounded-card p-[2px]"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}33 50%, ${accent} 100%)`,
      }}
    >
      <div className="rounded-[22px] bg-ink-soft px-8 py-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-mute">
          Majority Vote — {results.agreement}/3 Models Agree
        </p>

        <h2
          className="mt-4 font-serif text-7xl leading-none md:text-8xl"
          style={{ color: accent }}
        >
          {results.final}
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm">
          <span className="text-mute">
            Avg. Confidence:{" "}
            <span className="font-semibold text-cream">
              {Math.round(results.avgConf)}%
            </span>
          </span>
          <span className="h-1 w-1 rounded-full bg-mute/60" />
          <span className="text-mute">
            Agreement:{" "}
            <span className="font-semibold text-cream">
              {results.agreement}/3
            </span>
          </span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {[results.modelA, results.modelB, results.modelC].map((v) => (
            <span
              key={v.name}
              className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-xs font-medium text-cream/85"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: v.color }}
              />
              {v.name}
              <span
                className="ml-1 font-semibold"
                style={{ color: v.prediction === "REAL" ? "#5CB85C" : "#E25C5C" }}
              >
                {v.prediction}
              </span>
            </span>
          ))}
        </div>

        <button
          onClick={onReset}
          className="mt-10 inline-flex items-center gap-2 rounded-pill border border-cream/20 px-6 py-3 text-sm font-medium text-cream transition hover:bg-cream hover:text-ink"
        >
          <RefreshCw size={15} strokeWidth={2.2} />
          Analyze Another Image
        </button>
      </div>
    </motion.div>
  );
}
