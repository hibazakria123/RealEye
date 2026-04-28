"""
Quick diagnostic: load all 3 models, run inference on either a random
tensor or a real image, and print the raw logits + softmax probabilities
for each model. Use this to verify the class index convention.

Usage:
    cd backend
    python scripts/inspect_models.py                 # random tensor
    python scripts/inspect_models.py path/to/img.jpg # real image
    python scripts/inspect_models.py --label real path/to/known_real.jpg
    python scripts/inspect_models.py --label fake path/to/known_fake.jpg

When you pass --label, the script tells you which class index matched
the truth — that's how you discover whether class 0 is REAL or FAKE.
"""

import argparse
import sys
from pathlib import Path

import torch
from PIL import Image
from torchvision import transforms

# Make `models` importable when this script is run from the backend dir.
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from models import load_model_a, load_model_b, load_model_c  # noqa: E402


PREPROCESS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


def make_tensor(image_path: str | None) -> torch.Tensor:
    if image_path is None:
        torch.manual_seed(0)
        return torch.randn(1, 3, 224, 224)
    img = Image.open(image_path).convert("RGB")
    return PREPROCESS(img).unsqueeze(0)


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
    tensor = make_tensor(args.image)
    print(f"Input: {'random tensor' if not args.image else args.image}")
    print(f"Tensor shape: {tuple(tensor.shape)}\n")

    loaders = [
        ("DeepCNN",   load_model_a, weights_dir / "modelA.pth"),
        ("FocusCNN",  load_model_b, weights_dir / "modelB.pth"),
        ("HybridNet", load_model_c, weights_dir / "modelC.pth"),
    ]

    for name, fn, path in loaders:
        print(f"=== {name} ===")
        try:
            model = fn(path, device)
        except Exception as exc:
            print(f"  load FAILED: {type(exc).__name__}: {exc}\n")
            continue

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
                truth_says = "FAKE" if args.label == "fake" else "REAL"
                print(
                    f"  → If this image is truly {truth_says}, then class "
                    f"index {pred_idx} corresponds to {truth_says}."
                )
        else:
            prob = float(out.view(-1)[0].item())
            print(f"  sigmoid scalar: {prob:.4f}")

        print()


if __name__ == "__main__":
    main()
