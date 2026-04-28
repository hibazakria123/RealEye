"use client";

import { useCallback, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ModelCards from "../components/ModelCards";
import UploadZone from "../components/UploadZone";
import Results, { ModelVote, ResultsData } from "../components/Results";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ModelKey = "DeepCNN" | "FocusCNN" | "HybridNet";

const MODELS_META: Record<ModelKey, Omit<ModelVote, "prediction" | "confidence">> = {
  DeepCNN:   { name: "DeepCNN",   subtitle: "12-Layer Deep",     icon: "🔬", color: "#E8773A" },
  FocusCNN:  { name: "FocusCNN",  subtitle: "6-Layer Focused",   icon: "🎯", color: "#C9A5E8" },
  HybridNet: { name: "HybridNet", subtitle: "CNN + ViT",         icon: "🧬", color: "#5CB85C" },
};

type ApiVote = {
  model: string;
  prediction: "REAL" | "FAKE";
  confidence: number;
};

type ApiResult = {
  filename: string;
  models_used: number;
  result: {
    final_prediction: "REAL" | "FAKE";
    weighted_confidence: number;
    avg_confidence: number;
    agreement: string;
    agreement_ratio: number;
    individual_votes: ApiVote[];
  };
};

function rng(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeVote(meta: Omit<ModelVote, "prediction" | "confidence">, prediction: "REAL" | "FAKE", confidence: number): ModelVote {
  return { ...meta, prediction, confidence };
}

function mockAnalyze(): ResultsData {
  const keys: ModelKey[] = ["DeepCNN", "FocusCNN", "HybridNet"];
  const votes = keys.map((k) => {
    const prediction: "REAL" | "FAKE" = Math.random() > 0.5 ? "FAKE" : "REAL";
    const confidence = Math.round(rng(72, 99));
    return makeVote(MODELS_META[k], prediction, confidence);
  });

  const fakeCount = votes.filter((v) => v.prediction === "FAKE").length;
  const final: "REAL" | "FAKE" = fakeCount >= 2 ? "FAKE" : "REAL";
  const agreement = Math.max(fakeCount, votes.length - fakeCount);
  const avgConf = votes.reduce((s, v) => s + v.confidence, 0) / votes.length;

  return { modelA: votes[0], modelB: votes[1], modelC: votes[2], final, avgConf, agreement };
}

function mapApiResponse(payload: ApiResult): ResultsData {
  const byName = new Map<string, ApiVote>();
  for (const v of payload.result.individual_votes) byName.set(v.model, v);

  const pickVote = (key: ModelKey): ModelVote => {
    const meta = MODELS_META[key];
    const v = byName.get(key);
    if (!v) {
      // Model didn't run on backend (e.g. weights missing). Show a neutral
      // placeholder so the UI doesn't crash.
      return makeVote(meta, payload.result.final_prediction, 0);
    }
    return makeVote(meta, v.prediction, Math.round(v.confidence));
  };

  return {
    modelA: pickVote("DeepCNN"),
    modelB: pickVote("FocusCNN"),
    modelC: pickVote("HybridNet"),
    final: payload.result.final_prediction,
    avgConf: payload.result.avg_confidence,
    agreement: countAgreement([
      pickVote("DeepCNN"),
      pickVote("FocusCNN"),
      pickVote("HybridNet"),
    ], payload.result.final_prediction),
  };
}

function countAgreement(votes: ModelVote[], final: "REAL" | "FAKE"): number {
  return votes.filter((v) => v.prediction === final).length;
}

async function callDetect(file: File, signal: AbortSignal): Promise<ApiResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/detect`, {
    method: "POST",
    body: form,
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as ApiResult;
}

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setImageFile(file);
    setResults(null);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleReset = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setResults(null);
    setIsAnalyzing(false);
    setErrorMessage(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageFile || isAnalyzing) return;
    setIsAnalyzing(true);
    setResults(null);
    setErrorMessage(null);

    const controller = new AbortController();
    try {
      const payload = await callDetect(imageFile, controller.signal);
      setResults(mapApiResponse(payload));
    } catch (err) {
      const reason =
        err instanceof TypeError
          ? `Could not reach ${API_URL}. Start it with: python3 -m uvicorn app:app --port 8000`
          : err instanceof Error
            ? err.message
            : "Unknown error contacting the backend.";
      setErrorMessage(reason);
      setResults(mockAnalyze());
    } finally {
      setIsAnalyzing(false);
      window.setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [imageFile, isAnalyzing]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const scrollToUpload = useCallback(() => scrollTo("upload"), [scrollTo]);
  const scrollToHow = useCallback(() => scrollTo("how"), [scrollTo]);

  return (
    <>
      <Navbar onCta={scrollToUpload} />
      <main>
        <Hero onUpload={scrollToUpload} onLearn={scrollToHow} />
        <ModelCards />
        <UploadZone
          preview={imagePreview}
          isAnalyzing={isAnalyzing}
          dragOver={dragOver}
          errorMessage={errorMessage}
          onFile={handleFile}
          onSetDragOver={setDragOver}
          onAnalyze={handleAnalyze}
          onReset={handleReset}
        />
        <Results
          isAnalyzing={isAnalyzing}
          results={results}
          onReset={handleReset}
        />
        <HowItWorks />
        <Footer />
      </main>
    </>
  );
}
