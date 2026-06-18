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
    subtitle: "12-Layer Deep Texture expert",
    icon: "🔬",
    color: "#E8773A",
  },
  {
    key: "modelB",
    name: "FocusCNN",
    subtitle: "6-Layer Focused Region expert",
    icon: "🎯",
    color: "#C9A5E8",
  },
  {
    key: "modelC",
    name: "HybridNet",
    subtitle: "CNN + ViT Global + Attention",
    icon: "🧬",
    color: "#5CB85C",
  },
] as const;

type ModelVote = {
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  prediction: "REAL" | "FAKE";
  confidence: number;
};

// Matches the new app.py response structure exactly
type ApiResponse = {
  filename: string;
  ensemble_result: "REAL" | "FAKE";
  ensemble_confidence: number;
  votes: {
    FAKE: number;
    REAL: number;
  };
  individual_models: Array<{
    model_name: string;
    prediction: "REAL" | "FAKE";
    confidence: number;
    fake_prob: number;
    real_prob: number;
  }>;
  region_scores: Record<string, number>;
  most_suspicious_region: string | null;
};

async function analyzeImage(file: File): Promise<ResultsData> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/detect", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to analyze image");
  }

  const data: ApiResponse = await response.json();

  const modelMap: Record<string, string> = {
    DeepCNN: "modelA",
    FocusCNN: "modelB",
    HybridNet: "modelC",
  };

  const votes: Record<string, ModelVote> = {};
  data.individual_models.forEach((item) => {
    const key = modelMap[item.model_name];
    const meta = MODELS_META.find((m) => m.key === key);
    if (meta) {
      votes[key] = {
        name: meta.name,
        subtitle: meta.subtitle,
        icon: meta.icon,
        color: meta.color,
        prediction: item.prediction,
        confidence: Math.round(item.confidence * 100),
      };
    }
  });

  // Agreement = percentage of models that agreed with ensemble
  const totalModels = data.individual_models.length;
  const agreeingModels =
    data.ensemble_result === "FAKE" ? data.votes.FAKE : data.votes.REAL;
  const agreement = agreeingModels;

  // Average confidence across all individual models
  const avgConf =
    totalModels > 0
      ? Math.round(
          (data.individual_models.reduce((sum, m) => sum + m.confidence, 0) /
            totalModels) *
            100
        )
      : Math.round(data.ensemble_confidence * 100);

  return {
    modelA: votes.modelA,
    modelB: votes.modelB,
    modelC: votes.modelC,
    final: data.ensemble_result,
    avgConf,
    agreement,
    regionScores: data.region_scores ?? {},
    mostSuspicious: data.most_suspicious_region ?? null,
  };
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
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

  const handleAnalyze = useCallback(async () => {
    if (!image || isAnalyzing) return;
    setIsAnalyzing(true);
    setResults(null);
    try {
      const analysisResult = await analyzeImage(image);
      setResults(analysisResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze the image. Please try again.");
    } finally {
      setIsAnalyzing(false);
      window.setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [image, isAnalyzing]);

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
