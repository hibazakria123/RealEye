"use client";

import { useCallback, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ModelCards from "../components/ModelCards";
import UploadZone from "../components/UploadZone";
import Results, { ResultsData } from "../components/Results";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";

const MODELS_META = [
  {
    key: "modelA",
    name: "DeepCNN",
    subtitle: "12-Layer Deep",
    icon: "🔬",
    color: "#E8773A",
  },
  {
    key: "modelB",
    name: "FocusCNN",
    subtitle: "6-Layer Focused",
    icon: "🎯",
    color: "#C9A5E8",
  },
  {
    key: "modelC",
    name: "HybridNet",
    subtitle: "CNN + ViT",
    icon: "🧬",
    color: "#5CB85C",
  },
] as const;

function rng(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function mockAnalyze(): ResultsData {
  const votes = MODELS_META.map((m) => {
    const prediction: "REAL" | "FAKE" = Math.random() > 0.5 ? "FAKE" : "REAL";
    const confidence = Math.round(rng(72, 99));
    return {
      name: m.name,
      subtitle: m.subtitle,
      icon: m.icon,
      color: m.color,
      prediction,
      confidence,
    };
  });

  const fakeCount = votes.filter((v) => v.prediction === "FAKE").length;
  const final: "REAL" | "FAKE" = fakeCount >= 2 ? "FAKE" : "REAL";
  const agreement = Math.max(fakeCount, 3 - fakeCount);
  const avgConf = votes.reduce((s, v) => s + v.confidence, 0) / 3;

  return {
    modelA: votes[0],
    modelB: votes[1],
    modelC: votes[2],
    final,
    avgConf,
    agreement,
  };
}

export default function Home() {
  const [, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    setImage(file);
    setResults(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleReset = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    setResults(null);
    setIsAnalyzing(false);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!imagePreview || isAnalyzing) return;
    setIsAnalyzing(true);
    setResults(null);
    window.setTimeout(() => {
      setResults(mockAnalyze());
      setIsAnalyzing(false);
      window.setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }, 3200);
  }, [imagePreview, isAnalyzing]);

  const scrollToUpload = useCallback(() => {
    document
      .getElementById("upload")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <Navbar onCta={scrollToUpload} />
      <main>
        <Hero onUpload={scrollToUpload} />
        <ModelCards />
        <UploadZone
          preview={imagePreview}
          isAnalyzing={isAnalyzing}
          dragOver={dragOver}
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
