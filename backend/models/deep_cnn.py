from pathlib import Path
from typing import Optional, Union

import torch
import torch.nn as nn


class DeepCNN(nn.Module):
    """
    Three convolutional blocks → adaptive avg-pool → FC head.

    Outputs raw 2-class logits (no sigmoid). Inference applies softmax + argmax.
    Convention: class 0 = REAL, class 1 = FAKE.

    State dict keys (matches modelA.pth):
        block1.0 / block1.2 / block1.3       Conv2d / BatchNorm2d / Conv2d
        block2.0 / block2.2 / block2.3       Conv2d / BatchNorm2d / Conv2d
        block3.0 / block3.2 / block3.3       Conv2d / BatchNorm2d / Conv2d
        classifier.1                          Linear(128*6*6=4608, 512)
        classifier.4                          Linear(512, 2)

    AdaptiveAvgPool2d((6,6)) is parameter-free, so it doesn't appear in
    the state dict — but it's what locks the spatial dim to 6x6 regardless
    of input image size.
    """

    def __init__(self, num_classes: int = 2) -> None:
        super().__init__()

        self.block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),    # block1.0
            nn.ReLU(inplace=True),                          # block1.1
            nn.BatchNorm2d(32),                             # block1.2
            nn.Conv2d(32, 32, kernel_size=3, padding=1),    # block1.3
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout(0.25),
        )

        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),    # block2.0
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(64),                             # block2.2
            nn.Conv2d(64, 64, kernel_size=3, padding=1),    # block2.3
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout(0.25),
        )

        self.block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),   # block3.0
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(128),                            # block3.2
            nn.Conv2d(128, 128, kernel_size=3, padding=1),  # block3.3
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout(0.25),
        )

        self.adaptive_pool = nn.AdaptiveAvgPool2d((6, 6))

        self.classifier = nn.Sequential(
            nn.Flatten(),                                   # classifier.0
            nn.Linear(128 * 6 * 6, 512),                    # classifier.1
            nn.ReLU(inplace=True),                          # classifier.2
            nn.Dropout(0.5),                                # classifier.3
            nn.Linear(512, num_classes),                    # classifier.4
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.adaptive_pool(x)
        return self.classifier(x)


def load_model_a(
    weights_path: Optional[Union[str, Path]] = None,
    device: Union[str, torch.device] = "cpu",
) -> DeepCNN:
    """Instantiate DeepCNN, optionally load modelA.pth, move to device, set eval()."""
    model = DeepCNN()
    if weights_path is not None:
        path = Path(weights_path)
        if path.exists():
            state = torch.load(path, map_location=device, weights_only=False)
            if isinstance(state, dict):
                if "model_state_dict" in state:
                    state = state["model_state_dict"]
                elif "state_dict" in state:
                    state = state["state_dict"]
            model.load_state_dict(state)
    return model.to(device).eval()
