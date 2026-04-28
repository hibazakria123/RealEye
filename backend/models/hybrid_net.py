from pathlib import Path
from typing import Optional, Union

import torch
import torch.nn as nn
import timm


class HybridNet(nn.Module):
    """
    CNN feature extractor + timm ViT.

    Architecture (matches modelC.pth state-dict, exact):
        cnn_feature_extractor.0  Conv2d(3, 64, 3, p=1)        [64, 3, 3, 3]
        cnn_feature_extractor.3  Conv2d(64, 128, 3, p=1)      [128, 64, 3, 3]
        cnn_feature_extractor.6  Conv2d(128, 256, 3, p=1)     [256, 128, 3, 3]

        vit.cls_token                 [1, 1, 768]
        vit.pos_embed                 [1, 197, 768]   # 14*14 + 1 → 224×224 input
        vit.patch_embed.proj          Conv2d(3, 768, 16, stride=16)
        vit.blocks.0..11              standard ViT base
        vit.norm                      LayerNorm(768)
        vit.head                      Linear(768, 2)  ← 2-class output

    The CNN's output (256-d after AdaptiveAvgPool2d(1)) cannot feed
    vit.head directly because vit.head's weight is [2, 768], not [2, 1024].
    Per definitive guidance, the final classification comes from the ViT
    alone. The CNN parameters load successfully but are not used in
    forward() — they exist for state-dict compatibility.

    Input: 224×224 RGB.
    """

    BACKBONE_NAME = "vit_base_patch16_224.augreg2_in21k_ft_in1k"
    INPUT_SIZE = 224

    def __init__(self, num_classes: int = 2, pretrained: bool = False) -> None:
        super().__init__()

        self.cnn_feature_extractor = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1),     # 0
            nn.ReLU(inplace=True),                           # 1
            nn.MaxPool2d(2),                                 # 2
            nn.Conv2d(64, 128, kernel_size=3, padding=1),    # 3
            nn.ReLU(inplace=True),                           # 4
            nn.MaxPool2d(2),                                 # 5
            nn.Conv2d(128, 256, kernel_size=3, padding=1),   # 6
            nn.ReLU(inplace=True),                           # 7
            nn.AdaptiveAvgPool2d(1),                         # 8
        )

        self.vit = timm.create_model(
            self.BACKBONE_NAME,
            pretrained=pretrained,
            num_classes=num_classes,
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Final classification comes from the ViT (vit.head is Linear(768, 2)).
        return self.vit(x)


def load_model_c(
    weights_path: Optional[Union[str, Path]] = None,
    device: Union[str, torch.device] = "cpu",
) -> HybridNet:
    """
    Build HybridNet and load modelC.pth if present.

    With weights: instantiate without timm pretrained download (the .pth
    supplies everything). Without weights: fall back to a pretrained ViT
    plus a fresh 2-class head — useful for development before modelC.pth
    is available.
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
