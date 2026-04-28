from pathlib import Path
from typing import Optional, Union

import torch
import torch.nn as nn
import timm


class HybridNet(nn.Module):
    """
    timm ViT backbone (vit_base_patch16_224.augreg2_in21k_ft_in1k) with a
    custom classification head.

    Backbone is created with num_classes=0 so it returns a 768-d feature
    vector. The head outputs a single sigmoid score.
    """

    BACKBONE_NAME = "vit_base_patch16_224.augreg2_in21k_ft_in1k"
    EMBED_DIM = 768

    def __init__(self, pretrained: bool = True) -> None:
        super().__init__()
        self.backbone = timm.create_model(
            self.BACKBONE_NAME,
            pretrained=pretrained,
            num_classes=0,
        )
        self.head = nn.Sequential(
            nn.LayerNorm(self.EMBED_DIM),
            nn.Linear(self.EMBED_DIM, 256),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.backbone(x)
        return self.head(features)


def load_model_c(
    weights_path: Optional[Union[str, Path]] = None,
    device: Union[str, torch.device] = "cpu",
) -> HybridNet:
    """
    Instantiate HybridNet with the pretrained timm ViT backbone.

    If `weights_path` is given AND the file exists, load it on top of the
    pretrained backbone. Otherwise the pretrained ViT is used as-is (with
    a freshly-initialized classification head).
    """
    model = HybridNet(pretrained=True)
    if weights_path is not None:
        path = Path(weights_path)
        if path.exists():
            state = torch.load(path, map_location=device)
            if isinstance(state, dict) and "state_dict" in state:
                state = state["state_dict"]
            model.load_state_dict(state)
    return model.to(device).eval()
