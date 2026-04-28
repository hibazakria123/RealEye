from pathlib import Path
from typing import Optional, Union

import torch
import torch.nn as nn


class FocusCNN(nn.Module):
    """
    Lightweight CNN — no BatchNorm. Three Conv→ReLU→MaxPool→Dropout blocks
    inlined into one Sequential, then flatten → FC head.

    Outputs raw 2-class logits (no sigmoid).

    Input: 48×48 RGB (48 → 24 → 12 → 6, flatten 128*6*6 = 4608)

    State dict layout (modelB.pth, exact):
        features.0    Conv2d(3, 32, 3, p=1)       weight [32, 3, 3, 3]
        features.4    Conv2d(32, 64, 3, p=1)      weight [64, 32, 3, 3]
        features.8    Conv2d(64, 128, 3, p=1)     weight [128, 64, 3, 3]
        classifier.1  Linear(4608, 512)           weight [512, 4608]
        classifier.4  Linear(512, 2)              weight [2, 512]

    Sequential indices (0..11):
        0:  Conv2d(3, 32)
        1:  ReLU
        2:  MaxPool2d(2)
        3:  Dropout(0.25)
        4:  Conv2d(32, 64)
        5:  ReLU
        6:  MaxPool2d(2)
        7:  Dropout(0.25)
        8:  Conv2d(64, 128)
        9:  ReLU
        10: MaxPool2d(2)
        11: Dropout(0.25)
    """

    INPUT_SIZE = 48

    def __init__(self, num_classes: int = 2) -> None:
        super().__init__()

        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),    # 0
            nn.ReLU(inplace=True),                          # 1
            nn.MaxPool2d(2),                                # 2
            nn.Dropout(0.25),                               # 3
            nn.Conv2d(32, 64, kernel_size=3, padding=1),    # 4
            nn.ReLU(inplace=True),                          # 5
            nn.MaxPool2d(2),                                # 6
            nn.Dropout(0.25),                               # 7
            nn.Conv2d(64, 128, kernel_size=3, padding=1),   # 8
            nn.ReLU(inplace=True),                          # 9
            nn.MaxPool2d(2),                                # 10
            nn.Dropout(0.25),                               # 11
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),                       # .0
            nn.Linear(128 * 6 * 6, 512),        # .1
            nn.ReLU(inplace=True),              # .2
            nn.Dropout(0.5),                    # .3
            nn.Linear(512, num_classes),        # .4
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
