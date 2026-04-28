import io
import logging
import os
from pathlib import Path
from typing import Dict, Optional, Tuple

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms

from models import load_model_a, load_model_b, load_model_c, majority_vote


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("deepguard")

WEIGHTS_DIR = Path(__file__).parent / "weights"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
FAKE_THRESHOLD = 0.5

# Standard ImageNet normalization. If your training used something else
# (e.g. [0.5, 0.5, 0.5] / [0.5, 0.5, 0.5]), update these.
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]


def _make_preprocess(size: int) -> transforms.Compose:
    return transforms.Compose([
        transforms.Resize((size, size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORM_MEAN, std=NORM_STD),
    ])


# Two pipelines: 48×48 for the CNNs, 224×224 for HybridNet.
PREPROCESS_48 = _make_preprocess(48)
PREPROCESS_224 = _make_preprocess(224)


app = FastAPI(
    title="DeepGuard",
    description="Deepfake detection via 3-model majority voting",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Each entry: (model, preprocess_pipeline). model=None when load failed.
MODELS: Dict[str, Tuple[Optional[torch.nn.Module], transforms.Compose]] = {
    "DeepCNN":   (None, PREPROCESS_48),
    "FocusCNN":  (None, PREPROCESS_48),
    "HybridNet": (None, PREPROCESS_224),
}


def _safe_load(name: str, fn, *args, **kwargs) -> Optional[torch.nn.Module]:
    try:
        model = fn(*args, **kwargs)
        logger.info("[%s] ready", name)
        return model
    except Exception as exc:
        logger.exception("[%s] failed to load: %s", name, exc)
        return None


@app.on_event("startup")
def load_models() -> None:
    MODELS["DeepCNN"] = (
        _safe_load("DeepCNN", load_model_a, WEIGHTS_DIR / "modelA.pth", DEVICE),
        PREPROCESS_48,
    )
    MODELS["FocusCNN"] = (
        _safe_load("FocusCNN", load_model_b, WEIGHTS_DIR / "modelB.pth", DEVICE),
        PREPROCESS_48,
    )
    # modelC.pth is optional — pretrained ViT is used as fallback.
    MODELS["HybridNet"] = (
        _safe_load("HybridNet", load_model_c, WEIGHTS_DIR / "modelC.pth", DEVICE),
        PREPROCESS_224,
    )


# Class order is configurable via env var so you can flip it without
# editing code. Default follows the most common convention (class 0 = REAL,
# class 1 = FAKE). If your training labelled the other way around, set:
#   DEEPGUARD_CLASS_ORDER=FAKE,REAL
def _resolve_class_names() -> tuple:
    raw = os.environ.get("DEEPGUARD_CLASS_ORDER", "REAL,FAKE")
    parts = tuple(p.strip().upper() for p in raw.split(",") if p.strip())
    if len(parts) != 2 or set(parts) != {"REAL", "FAKE"}:
        logger.warning(
            "Invalid DEEPGUARD_CLASS_ORDER=%r, falling back to REAL,FAKE", raw
        )
        return ("REAL", "FAKE")
    return parts


CLASS_NAMES = _resolve_class_names()
logger.info("Class order: index 0 = %s, index 1 = %s", CLASS_NAMES[0], CLASS_NAMES[1])


def _predict_single(model: torch.nn.Module, tensor: torch.Tensor, name: str = "") -> Dict:
    """Run one forward pass and convert the output to label + confidence."""
    with torch.no_grad():
        output = model(tensor)

    flat = output.view(output.shape[0], -1) if output.dim() > 1 else output.view(1, -1)
    n = flat.shape[-1]

    if n == 2:
        logits = flat[0]
        probs = torch.softmax(logits, dim=0)
        pred_idx = int(torch.argmax(probs).item())
        confidence = float(probs[pred_idx].item())
        label = CLASS_NAMES[pred_idx]
        raw = {
            "logits": [round(float(logits[0].item()), 4), round(float(logits[1].item()), 4)],
            "probs": [round(float(probs[0].item()), 4), round(float(probs[1].item()), 4)],
        }
        logger.info(
            "[%s] logits=%s probs=%s argmax=%d → %s (%.4f)",
            name or "?", raw["logits"], raw["probs"], pred_idx, label, confidence,
        )
    else:
        prob = float(flat[0, 0].item())
        is_fake = prob > FAKE_THRESHOLD
        label = "FAKE" if is_fake else "REAL"
        confidence = prob if is_fake else 1.0 - prob
        raw = round(prob, 4)
        logger.info("[%s] sigmoid=%.4f → %s (%.4f)", name or "?", prob, label, confidence)

    return {
        "prediction": label,
        "confidence": round(confidence, 4),
        "raw_score": raw,
    }


def _run_model(
    name: str,
    model: torch.nn.Module,
    image: Image.Image,
    preprocess: transforms.Compose,
) -> Dict:
    tensor = preprocess(image).unsqueeze(0).to(DEVICE)
    result = _predict_single(model, tensor, name=name)
    result["model_name"] = name
    return result


@app.get("/health")
def health() -> Dict:
    return {
        "status": "ok",
        "device": str(DEVICE),
        "class_order": list(CLASS_NAMES),
        "models_loaded": {name: model is not None for name, (model, _) in MODELS.items()},
    }


@app.post("/detect")
async def detect(file: UploadFile = File(...)) -> Dict:
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    predictions = []
    for name, (model, preprocess) in MODELS.items():
        if model is None:
            continue
        try:
            predictions.append(_run_model(name, model, image, preprocess))
        except Exception as exc:
            logger.exception("[%s] inference failed: %s", name, exc)

    if not predictions:
        raise HTTPException(status_code=503, detail="No models available for inference")

    voted = majority_vote(predictions)
    total = len(predictions)
    agreement_count = int(voted["agreement"])

    result = {
        "final_prediction": voted["final_prediction"],
        "weighted_confidence": round(float(voted["weighted_confidence"]) * 100, 2),
        "avg_confidence": round(float(voted["avg_confidence"]) * 100, 2),
        "agreement": f"{agreement_count}/{total}",
        "agreement_ratio": round(agreement_count / total, 4),
        "individual_votes": [
            {
                "model": p["model_name"],
                "prediction": p["prediction"],
                "confidence": round(float(p["confidence"]) * 100, 2),
            }
            for p in voted["individual_votes"]
        ],
    }

    return {
        "filename": file.filename,
        "models_used": total,
        "result": result,
    }
