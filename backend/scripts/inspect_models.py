"""
Quick diagnostic: load all 3 models, run inference on either a random
tensor or a real image, and print the raw logits + softmax probabilities
for each model. Use this to verify the class index convention.

Each model is fed at its native input size (DeepCNN/FocusCNN: 48×48,
HybridNet: 224×224).

Usage:
    cd backend
    python scripts/inspect_models.py                 # random tensors
    python scripts/inspect_models.py path/to/img.jpg # real image
    python scripts/inspect_models.py --label real path/to/known_real.jpg
    python scripts/inspect_models.py --label fake path/to/known_fake.jpg

When you pass --label, the script tells you which class index matched
the truth — that's how you discover whether class 0 is REAL or FAKE.
"""

import argparse
import sys
from pathlib import Path
from typing import Optional

import torch
from PIL import Image
from torchvision import transforms

# Make `models` importable when this script is run from the backend dir.
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from models import (  # noqa: E402
    DeepCNN,
    FocusCNN,
    HybridNet,
    load_model_a,
    load_model_b,
    load_model_c,
)


def make_preprocess(size: int) -> transforms.Compose:
    return transforms.Compose([
        transforms.Resize((size, size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])


def make_tensor(image_path: Optional[str], size: int) -> torch.Tensor:
    if image_path is None:
        torch.manual_seed(0)
        return torch.randn(1, 3, size, size)
    img = Image.open(image_path).convert("RGB")
    return make_preprocess(size)(img).unsqueeze(0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", nargs="?", help="path to image (optional)")
    parser.add_argument(
        "--label",
        choices=["real", "fake"],
        help="ground-truth label of the image; lets the script tell you "
             "which class index represents that label",
    )
    args = parser.parse_args()

    weights_dir = ROOT / "weights"
    device = "cpu"
    print(f"Input: {'random tensor' if not args.image else args.image}\n")

    loaders = [
        ("DeepCNN",   load_model_a, weights_dir / "modelA.pth",   DeepCNN.INPUT_SIZE),
        ("FocusCNN",  load_model_b, weights_dir / "modelB.pth",   FocusCNN.INPUT_SIZE),
        ("HybridNet", load_model_c, weights_dir / "modelC.pth",   HybridNet.INPUT_SIZE),
    ]

    for name, fn, path, size in loaders:
        print(f"=== {name} (input {size}×{size}) ===")
        try:
            model = fn(path, device)
        except Exception as exc:
            print(f"  load FAILED: {type(exc).__name__}: {exc}\n")
            continue

        tensor = make_tensor(args.image, size)
        with torch.no_grad():
            out = model(tensor)

        print(f"  output shape: {tuple(out.shape)}")
        print(f"  raw logits:   {out.flatten().tolist()}")

        if out.numel() == 2 or (out.dim() > 1 and out.shape[-1] == 2):
            probs = torch.softmax(out.view(1, -1)[0], dim=0)
            pred_idx = int(torch.argmax(probs).item())
            print(f"  softmax:      {[round(p, 4) for p in probs.tolist()]}")
            print(f"  argmax:       index {pred_idx} (probability {probs[pred_idx]:.4f})")
            if args.label:
                truth = args.label.upper()
                print(
                    f"  → If this image is truly {truth}, then class "
                    f"index {pred_idx} corresponds to {truth}."
                )
        else:
            prob = float(out.view(-1)[0].item())
            print(f"  sigmoid scalar: {prob:.4f}")

        print()


if __name__ == "__main__":
    main()
