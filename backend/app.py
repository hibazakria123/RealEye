import io
import logging
from pathlib import Path
from typing import Dict, Optional

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms

from models import DeepCNN, FocusCNN, HybridNet, majority_vote


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


app = FastAPI(title="DeepGuard", description="Deepfake detection via 3-model majority voting")

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


def _try_load_weights(model: torch.nn.Module, path: Path, name: str) -> bool:
    if not path.exists():
        logger.warning("[%s] weights not found at %s", name, path)
        return False
    try:
        state = torch.load(path, map_location=DEVICE)
        if isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
        model.load_state_dict(state)
        logger.info("[%s] loaded weights from %s", name, path)
        return True
    except Exception as exc:
        logger.exception("[%s] failed to load weights: %s", name, exc)
        return False


@app.on_event("startup")
def load_models() -> None:
    # Model A
    deep = DeepCNN()
    _try_load_weights(deep, WEIGHTS_DIR / "modelA.pth", "DeepCNN")
    deep.to(DEVICE).eval()
    MODELS["DeepCNN"] = deep

    # Model B
    focus = FocusCNN()
    _try_load_weights(focus, WEIGHTS_DIR / "modelB.pth", "FocusCNN")
    focus.to(DEVICE).eval()
    MODELS["FocusCNN"] = focus

    # Model C — fine-tuned weights are optional for now.
    try:
        hybrid = HybridNet(pretrained=True)
        _try_load_weights(hybrid, WEIGHTS_DIR / "modelC.pth", "HybridNet")
        hybrid.to(DEVICE).eval()
        MODELS["HybridNet"] = hybrid
    except Exception as exc:
        logger.exception("Failed to initialize HybridNet: %s", exc)
        MODELS["HybridNet"] = None


def _interpret(prob: float) -> Dict:
    """Convert sigmoid output into label + confidence."""
    is_fake = prob > FAKE_THRESHOLD
    label = "FAKE" if is_fake else "REAL"
    confidence = float(prob if is_fake else 1.0 - prob)
    return {"prediction": label, "confidence": round(confidence, 4), "raw_score": round(float(prob), 4)}


def _run_model(name: str, model: torch.nn.Module, tensor: torch.Tensor) -> Dict:
    with torch.no_grad():
        output = model(tensor)
    prob = output.view(-1)[0].item()
    result = _interpret(prob)
    result["model"] = name
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
    return {
        "filename": file.filename,
        **result,
    }
