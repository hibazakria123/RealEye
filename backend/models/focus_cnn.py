from pathlib import Path
from typing import Optional, Union

import torch
import torch.nn as nn


class FocusCNN(nn.Module):
    """
    Lightweight CNN — three Conv2d layers, no BatchNorm, fixed 6x6 output.

    Outputs raw 2-class logits (no sigmoid). Inference applies softmax + argmax.
    Convention: class 0 = REAL, class 1 = FAKE.

    State dict keys (matches modelB.pth):
        features.0    Conv2d(3, 32)
        features.4    Conv2d(32, 64)
        features.8    Conv2d(64, 128)
        classifier.1  Linear(128*6*6=4608, 512)
        classifier.4  Linear(512, 2)

    The Sequential indices are kept aligned by parameter-free fillers
    (ReLU / MaxPool2d / Dropout) so the .pth keys land where expected.
    """

    def __init__(self, num_classes: int = 2) -> None:
        super().__init__()

        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),    # features.0
            nn.ReLU(inplace=True),                          # features.1
            nn.MaxPool2d(2),                                # features.2
            nn.Dropout(0.25),                               # features.3
            nn.Conv2d(32, 64, kernel_size=3, padding=1),    # features.4
            nn.ReLU(inplace=True),                          # features.5
            nn.MaxPool2d(2),                                # features.6
            nn.Dropout(0.25),                               # features.7
            nn.Conv2d(64, 128, kernel_size=3, padding=1),   # features.8
            nn.ReLU(inplace=True),                          # features.9
            nn.MaxPool2d(2),                                # features.10
            nn.AdaptiveAvgPool2d((6, 6)),                   # features.11
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),                                   # classifier.0
            nn.Linear(128 * 6 * 6, 512),                    # classifier.1
            nn.ReLU(inplace=True),                          # classifier.2
            nn.Dropout(0.5),                                # classifier.3
            nn.Linear(512, num_classes),                    # classifier.4
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        return self.classifier(x)


def load_model_b(
    weights_path: Optional[Union[str, Path]] = None,
    device: Union[str, torch.device] = "cpu",
) -> FocusCNN:
    """Instantiate FocusCNN, optionally load modelB.pth, move to device, set eval()."""
    model = FocusCNN()
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
