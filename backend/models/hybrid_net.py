from pathlib import Path
from typing import Optional, Union

import torch
import torch.nn as nn
import timm


class HybridNet(nn.Module):
    def __init__(self, num_classes: int = 2) -> None:
        super().__init__()

        self.cnn_feature_extractor = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )

        self.vit = timm.create_model('vit_base_patch16_224', pretrained=True)
        in_features = self.vit.head.in_features
        self.vit.head = nn.Linear(in_features, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Matches Kaggle: CNN features computed but only ViT output used
        _ = self.cnn_feature_extractor(x)
        out = self.vit(x)
        return out


def load_model_c(
    weights_path: Optional[Union[str, Path]] = None,
    device: Union[str, torch.device] = "cpu",
) -> HybridNet:
    model = HybridNet()
    if weights_path is not None:
        path = Path(weights_path)
        if path.exists():
            state = torch.load(path, map_location=device)
            if isinstance(state, dict) and "state_dict" in state:
                state = state["state_dict"]
            model.load_state_dict(state)
    return model.to(device).eval()
