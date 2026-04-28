"use client";

import { ImageIcon, RotateCcw } from "lucide-react";
import { ChangeEvent, DragEvent, useRef } from "react";
import { motion } from "framer-motion";
import Waveform from "./Waveform";

type Props = {
  preview: string | null;
  isAnalyzing: boolean;
  dragOver: boolean;
  errorMessage?: string | null;
  onFile: (file: File) => void;
  onSetDragOver: (v: boolean) => void;
  onAnalyze: () => void;
  onReset: () => void;
};

export default function UploadZone({
  preview,
  isAnalyzing,
  dragOver,
  errorMessage,
  onFile,
  onSetDragOver,
  onAnalyze,
  onReset,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    onSetDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
    e.target.value = "";
  };

  return (
    <section id="upload" className="bg-ink px-6 py-32 text-text-cream">
      <div className="dot-grid-dark pointer-events-none absolute inset-x-0 h-full opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-4xl">
        <div className="text-center">
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.24em] text-mute">
            Upload
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-display"
            style={{ fontSize: "clamp(40px, 6vw, 88px)", lineHeight: 1.0 }}
          >
            Analyze your <span style={{ color: "var(--color-coral)" }}>image.</span>
          </motion.h2>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-text-body-dark md:text-lg">
            Drop a photo and watch all three models weigh in. Real-time
            inference, transparent voting, no black boxes.
          </p>
        </div>

        <motion.label
          htmlFor="image-input"
          onDragOver={(e) => {
            e.preventDefault();
            onSetDragOver(true);
          }}
          onDragLeave={() => onSetDragOver(false)}
          onDrop={handleDrop}
          animate={
            dragOver
              ? { scale: 1.01, boxShadow: "0 0 0 2px var(--color-lavender)" }
              : { scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
          }
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className={`relative mt-14 block cursor-pointer overflow-hidden bg-ink-soft/70 p-2`}
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <span
            className="dashed-march pointer-events-none absolute inset-0"
            style={{
              borderRadius: "var(--radius-card)",
              color: dragOver ? "var(--color-lavender)" : "rgba(239,231,210,0.35)",
              transition: "color 200ms ease",
            }}
            aria-hidden
          />

          <input
            id="image-input"
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          {preview ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative mx-auto max-h-[480px] w-full max-w-2xl overflow-hidden"
              style={{ borderRadius: "calc(var(--radius-card) - 8px)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded preview"
                className="h-full w-full object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onReset();
                  inputRef.current?.click();
                }}
                className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-pill bg-ink/85 px-4 py-2 text-xs font-medium text-cream backdrop-blur transition hover:bg-ink"
              >
                <RotateCcw size={14} strokeWidth={2.2} />
                Change
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-cream/8 text-cream/70">
                <ImageIcon size={28} strokeWidth={1.6} />
              </span>
              <p className="mt-7 font-display text-3xl">Drop your image here</p>
              <p className="mt-3 text-sm text-mute">
                or click to browse — PNG, JPG, WEBP
              </p>
            </div>
          )}
        </motion.label>

        {preview ? (
          <div className="mt-10 flex justify-center">
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`glow-lavender inline-flex items-center gap-3 rounded-pill bg-lavender px-8 py-4 text-sm font-semibold text-text-dark transition active:scale-[0.98] disabled:cursor-progress disabled:opacity-95 ${
                isAnalyzing ? "" : "hover:scale-[1.02] animate-pulse-soft"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Waveform count={5} className="text-text-dark" />
                  Running 3-Model Analysis…
                </>
              ) : (
                <>Detect Deepfake</>
              )}
            </button>
          </div>
        ) : null}

        {errorMessage ? (
          <div
            role="alert"
            className="mx-auto mt-6 max-w-2xl rounded-2xl border border-danger/40 bg-danger/10 px-5 py-4 text-sm text-cream/95"
          >
            <p className="font-semibold text-danger">Backend unavailable</p>
            <p className="mt-1 text-cream/80">{errorMessage}</p>
            <p className="mt-2 text-xs text-mute">
              Showing a mock result so you can preview the UI.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
