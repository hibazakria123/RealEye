from pathlib import Path
from typing import Optional, Union

import torch
import torch.nn as nn


class DeepCNN(nn.Module):
    """
    Three convolutional blocks → flatten → FC head.

    Outputs raw 2-class logits (no sigmoid). Inference applies softmax + argmax.
    Convention follows the runtime configuration in app.py.

    Input: 48×48 RGB (after 3 MaxPool2d(2): 48 → 24 → 12 → 6 → flatten 128*6*6 = 4608)

    State dict layout (modelA.pth, exact):
        block1.0  Conv2d(3, 32, 3, p=1)        weight [32, 3, 3, 3]
        block1.2  BatchNorm2d(32)              weight [32]
        block1.3  Conv2d(32, 32, 3, p=1)       weight [32, 32, 3, 3]
        block2.0  Conv2d(32, 64, 3, p=1)       weight [64, 32, 3, 3]
        block2.2  BatchNorm2d(64)              weight [64]
        block2.3  Conv2d(64, 64, 3, p=1)       weight [64, 64, 3, 3]
        block3.0  Conv2d(64, 128, 3, p=1)      weight [128, 64, 3, 3]
        block3.2  BatchNorm2d(128)             weight [128]
        block3.3  Conv2d(128, 128, 3, p=1)     weight [128, 128, 3, 3]
        classifier.1  Linear(4608, 512)        weight [512, 4608]
        classifier.4  Linear(512, 2)           weight [2, 512]

    Per-block layer indices (0..6):
        0: Conv2d        1: ReLU       2: BatchNorm2d
        3: Conv2d        4: ReLU       5: MaxPool2d(2)
        6: Dropout(0.25)
    """

    INPUT_SIZE = 48

    def __init__(self, num_classes: int = 2) -> None:
        super().__init__()

        def block(in_ch: int, mid_ch: int, out_ch: int) -> nn.Sequential:
            return nn.Sequential(
                nn.Conv2d(in_ch, mid_ch, kernel_size=3, padding=1),  # .0
                nn.ReLU(inplace=True),                                # .1
                nn.BatchNorm2d(mid_ch),                               # .2
                nn.Conv2d(mid_ch, out_ch, kernel_size=3, padding=1),  # .3
                nn.ReLU(inplace=True),                                # .4
                nn.MaxPool2d(2),                                      # .5
                nn.Dropout(0.25),                                     # .6
            )

        self.block1 = block(3, 32, 32)
        self.block2 = block(32, 64, 64)
        self.block3 = block(64, 128, 128)

        self.classifier = nn.Sequential(
            nn.Flatten(),                       # .0
            nn.Linear(128 * 6 * 6, 512),        # .1
            nn.ReLU(inplace=True),              # .2
            nn.Dropout(0.5),                    # .3
            nn.Linear(512, num_classes),        # .4
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
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
