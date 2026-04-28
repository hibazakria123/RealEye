import io
import logging
from pathlib import Path
from typing import Dict, Optional

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

PREPROCESS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


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


MODELS: Dict[str, Optional[torch.nn.Module]] = {
    "DeepCNN": None,
    "FocusCNN": None,
    "HybridNet": None,
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
    MODELS["DeepCNN"] = _safe_load(
        "DeepCNN", load_model_a, WEIGHTS_DIR / "modelA.pth", DEVICE
    )
    MODELS["FocusCNN"] = _safe_load(
        "FocusCNN", load_model_b, WEIGHTS_DIR / "modelB.pth", DEVICE
    )
    # modelC.pth is optional — pretrained ViT is used as fallback.
    MODELS["HybridNet"] = _safe_load(
        "HybridNet", load_model_c, WEIGHTS_DIR / "modelC.pth", DEVICE
    )


CLASS_NAMES = ("REAL", "FAKE")  # class 0 = REAL, class 1 = FAKE


def _predict_single(model: torch.nn.Module, tensor: torch.Tensor) -> Dict:
    """
    Run one forward pass and convert the output to a label + confidence.

    Handles two output shapes:
      - 2-class logits (DeepCNN, FocusCNN): softmax → argmax,
        confidence = softmax probability of the predicted class.
      - 1-output sigmoid (HybridNet fallback): threshold at 0.5,
        confidence = prob if FAKE else 1 - prob.
    """
    with torch.no_grad():
        output = model(tensor)

    flat = output.view(output.shape[0], -1) if output.dim() > 1 else output.view(1, -1)
    n = flat.shape[-1]

    if n == 2:
        probs = torch.softmax(flat[0], dim=0)
        pred_idx = int(torch.argmax(probs).item())
        confidence = float(probs[pred_idx].item())
        label = CLASS_NAMES[pred_idx]
        raw = [round(float(probs[0].item()), 4), round(float(probs[1].item()), 4)]
    else:
        prob = float(flat[0, 0].item())
        is_fake = prob > FAKE_THRESHOLD
        label = "FAKE" if is_fake else "REAL"
        confidence = prob if is_fake else 1.0 - prob
        raw = round(prob, 4)

    return {
        "prediction": label,
        "confidence": round(confidence, 4),
        "raw_score": raw,
    }


def _run_model(name: str, model: torch.nn.Module, tensor: torch.Tensor) -> Dict:
    result = _predict_single(model, tensor)
    result["model_name"] = name
    return result


@app.get("/health")
def health() -> Dict:
    return {
        "status": "ok",
        "device": str(DEVICE),
        "models_loaded": {name: model is not None for name, model in MODELS.items()},
    }


@app.post("/detect")
async def detect(file: UploadFile = File(...)) -> Dict:
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    tensor = PREPROCESS(image).unsqueeze(0).to(DEVICE)

    predictions = []
    for name, model in MODELS.items():
        if model is None:
            continue
        try:
            predictions.append(_run_model(name, model, tensor))
        except Exception as exc:
            logger.exception("[%s] inference failed: %s", name, exc)

    if not predictions:
        raise HTTPException(status_code=503, detail="No models available for inference")

    result = majority_vote(predictions)
    return {"filename": file.filename, **result}
