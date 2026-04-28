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
