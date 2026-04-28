"use client";

import { ImageIcon, RotateCcw } from "lucide-react";
import { ChangeEvent, DragEvent, useRef } from "react";
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
    <section id="upload" className="bg-ink px-6 py-24 text-cream lg:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.22em] text-mute">
            Upload
          </span>
          <h2 className="font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
            Analyze your <span className="italic text-orange">image.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mute md:text-lg">
            Drop a photo and watch all three models weigh in. Real-time
            inference, transparent voting, no black boxes.
          </p>
        </div>

        <label
          htmlFor="image-input"
          onDragOver={(e) => {
            e.preventDefault();
            onSetDragOver(true);
          }}
          onDragLeave={() => onSetDragOver(false)}
          onDrop={handleDrop}
          className={`mt-12 block cursor-pointer rounded-card border-2 border-dashed bg-ink-soft/60 p-8 transition ${
            dragOver
              ? "border-orange bg-orange/10"
              : "border-cream/15 hover:border-cream/30"
          }`}
        >
          <input
            id="image-input"
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          {preview ? (
            <div className="relative mx-auto max-h-[480px] w-full max-w-2xl overflow-hidden rounded-2xl">
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-cream/8 text-cream/70">
                <ImageIcon size={28} strokeWidth={1.6} />
              </span>
              <p className="mt-6 font-serif text-2xl">Drop your image here</p>
              <p className="mt-2 text-sm text-mute">
                or click to browse — PNG, JPG, WEBP
              </p>
            </div>
          )}
        </label>

        {preview ? (
          <div className="mt-8 flex justify-center">
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="glow-orange inline-flex items-center gap-3 rounded-pill bg-orange px-8 py-4 text-sm font-semibold text-cream transition hover:bg-orange-soft disabled:cursor-progress disabled:opacity-95"
            >
              {isAnalyzing ? (
                <>
                  <Waveform count={5} className="text-cream" />
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
