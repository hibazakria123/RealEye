import io
import logging
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
import torch
import torch.nn.functional as F
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms

from models import load_model_a, load_model_b, load_model_c, majority_vote

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("realeye")

WEIGHTS_DIR = Path(__file__).parent / "weights"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

PREPROCESS_48 = transforms.Compose([
    transforms.Resize((50, 50)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])

PREPROCESS_224 = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])

app = FastAPI(title="RealEye", description="Deepfake detection via 3-model majority voting")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS: Dict[str, Optional[tuple]] = {
    "DeepCNN": None,
    "FocusCNN": None,
    "HybridNet": None,
}


def _safe_load(name, fn, *args, **kwargs):
    try:
        model = fn(*args, **kwargs)
        logger.info("[%s] loaded successfully", name)
        return model
    except Exception as exc:
        logger.exception("[%s] failed to load: %s", name, exc)
        return None


@app.on_event("startup")
def load_models():
    model_a = _safe_load("DeepCNN",   load_model_a, WEIGHTS_DIR / "modelA.pth", DEVICE)
    model_b = _safe_load("FocusCNN",  load_model_b, WEIGHTS_DIR / "modelB.pth", DEVICE)
    model_c = _safe_load("HybridNet", load_model_c, WEIGHTS_DIR / "modelC.pth", DEVICE)

    MODELS["DeepCNN"]   = (model_a, PREPROCESS_48)  if model_a else None
    MODELS["FocusCNN"]  = (model_b, PREPROCESS_48)  if model_b else None
    MODELS["HybridNet"] = (model_c, PREPROCESS_224) if model_c else None


def _run_model(name, model, tensor):
    with torch.no_grad():
        probs = F.softmax(model(tensor), dim=1)[0]
    fake_prob  = probs[0].item()
    real_prob  = probs[1].item()
    is_fake    = fake_prob > 0.5
    confidence = fake_prob if is_fake else real_prob
    return {
        "model_name": name,
        "prediction": "FAKE" if is_fake else "REAL",
        "confidence": round(confidence, 4),
        "fake_prob":  round(fake_prob, 4),
        "real_prob":  round(real_prob, 4),
    }


def analyze_face_regions(image_pil, models, transforms_list, device):
    w, h = image_pil.size
    regions = {
        "Eyes":       image_pil.crop((0,           int(h*0.1),  w,           int(h*0.45))),
        "Nose":       image_pil.crop((int(w*0.2),  int(h*0.35), int(w*0.8),  int(h*0.65))),
        "Mouth":      image_pil.crop((int(w*0.2),  int(h*0.6),  int(w*0.8),  int(h*0.9))),
        "Left Side":  image_pil.crop((0,           0,           int(w*0.5),  h)),
        "Right Side": image_pil.crop((int(w*0.5),  0,           w,           h)),
    }
    region_scores = {}
    for region_name, region_img in regions.items():
        scores = []
        for model, transform in zip(models, transforms_list):
            model.eval()
            with torch.no_grad():
                rw, rh = region_img.size
                if rw < 20 or rh < 20:
                    scores.append(0.5)
                    continue
                tensor = transform(region_img.convert("RGB")).unsqueeze(0).to(device)
                probs  = torch.softmax(model(tensor), dim=1)[0]
                scores.append(probs[0].item())
        region_scores[region_name] = round(float(np.mean(scores)) * 100, 1)
    return region_scores


@app.get("/health")
def health():
    return {
        "status": "ok",
        "device": str(DEVICE),
        "models_loaded": {name: entry is not None for name, entry in MODELS.items()},
    }


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    individual_results, votes = [], []

    for name, entry in MODELS.items():
        if entry is None:
            continue
        model, preprocess = entry
        try:
            tensor = preprocess(image).unsqueeze(0).to(DEVICE)
            result = _run_model(name, model, tensor)
            individual_results.append(result)
            votes.append(result["prediction"])
        except Exception as exc:
            logger.exception("[%s] inference failed: %s", name, exc)

    if not votes:
        raise HTTPException(status_code=503, detail="No models available for inference")

    fake_votes     = votes.count("FAKE")
    real_votes     = votes.count("REAL")
    ensemble_label = "FAKE" if fake_votes > real_votes else "REAL"

    agreeing       = [r for r in individual_results if r["prediction"] == ensemble_label]
    avg_confidence = round(sum(r["confidence"] for r in agreeing) / len(agreeing), 4)

    active_models     = [e[0] for e in MODELS.values() if e is not None]
    active_transforms = [e[1] for e in MODELS.values() if e is not None]

    region_scores = analyze_face_regions(image, active_models, active_transforms, DEVICE)

    # Flip scores for REAL images so bars show realness confidence
    if ensemble_label == "REAL":
        region_scores = {k: round(100 - v, 1) for k, v in region_scores.items()}

    most_suspicious = max(region_scores, key=region_scores.get) if region_scores else None

    return {
        "filename":               file.filename,
        "ensemble_result":        ensemble_label,
        "ensemble_confidence":    avg_confidence,
        "votes":                  {"FAKE": fake_votes, "REAL": real_votes},
        "individual_models":      individual_results,
        "region_scores":          region_scores,
        "most_suspicious_region": most_suspicious,
    }