from pathlib import Path
from typing import Optional, Union

import torch
import torch.nn as nn
import timm


class HybridNet(nn.Module):
    """
    CNN preprocessor + ViT classifier.

    Architecture (matches modelC.pth state-dict layout):
        cnn_feature_extractor.0  Conv2d(3, 64)
        cnn_feature_extractor.3  Conv2d(64, 128)
        cnn_feature_extractor.6  Conv2d(128, 3)     # back to 3 channels for ViT
        vit                       timm.create_model("vit_base_patch16_224.augreg2_in21k_ft_in1k")
                                    with num_classes=2 — i.e. vit.head is Linear(768, 2)

    The ViT's standard 3-channel patch_embed.proj is preserved, so the CNN
    preprocessor must output 3 channels in its last Conv2d.

    Index gaps (1, 2, 4, 5, 7) are parameter-free fillers (ReLU + Dropout2d)
    chosen so that Conv2d lands at indices 0, 3, 6 in the Sequential, which
    is what the .pth state_dict requires.

    Outputs raw 2-class logits.
    """

    BACKBONE_NAME = "vit_base_patch16_224.augreg2_in21k_ft_in1k"

    def __init__(self, num_classes: int = 2, pretrained: bool = False) -> None:
        super().__init__()

        self.cnn_feature_extractor = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1),     # 0
            nn.ReLU(inplace=True),                           # 1
            nn.Dropout2d(0.1),                               # 2
            nn.Conv2d(64, 128, kernel_size=3, padding=1),    # 3
            nn.ReLU(inplace=True),                           # 4
            nn.Dropout2d(0.1),                               # 5
            nn.Conv2d(128, 3, kernel_size=3, padding=1),     # 6
            nn.ReLU(inplace=True),                           # 7
        )

        self.vit = timm.create_model(
            self.BACKBONE_NAME,
            pretrained=pretrained,
            num_classes=num_classes,
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.cnn_feature_extractor(x)
        return self.vit(x)


def load_model_c(
    weights_path: Optional[Union[str, Path]] = None,
    device: Union[str, torch.device] = "cpu",
) -> HybridNet:
    """
    Build HybridNet and load modelC.pth if present.

    When weights are available, the ViT is created without downloading
    pretrained weights (custom .pth supplies everything). When the file
    is missing, the ViT falls back to ImageNet pretrained weights with a
    fresh 2-class head — useful for development without modelC.pth.
    """
    path = Path(weights_path) if weights_path else None

    if path is not None and path.exists():
        model = HybridNet(num_classes=2, pretrained=False)
        state = torch.load(path, map_location=device, weights_only=False)
        if isinstance(state, dict):
            if "model_state_dict" in state:
                state = state["model_state_dict"]
            elif "state_dict" in state:
                state = state["state_dict"]
        model.load_state_dict(state)
    else:
        model = HybridNet(num_classes=2, pretrained=True)

    return model.to(device).eval()
