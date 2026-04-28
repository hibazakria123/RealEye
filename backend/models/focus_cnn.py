import torch
import torch.nn as nn


class FocusCNN(nn.Module):
    """
    Lightweight CNN with adaptive global pooling.

    State dict layout (matches modelB.pth):
        features.0   Conv2d(3, 32)
        features.1   BatchNorm2d(32)
        features.4   Conv2d(32, 64)
        features.5   BatchNorm2d(64)
        features.8   Conv2d(64, 128)
        features.9   BatchNorm2d(128)
        classifier.1 Linear(128, 64)
        classifier.4 Linear(64, 1)
    """

    def __init__(self) -> None:
        super().__init__()

        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),    # features.0
            nn.BatchNorm2d(32),                            # features.1
            nn.ReLU(inplace=True),                         # features.2
            nn.MaxPool2d(2),                               # features.3
            nn.Conv2d(32, 64, kernel_size=3, padding=1),   # features.4
            nn.BatchNorm2d(64),                            # features.5
            nn.ReLU(inplace=True),                         # features.6
            nn.MaxPool2d(2),                               # features.7
            nn.Conv2d(64, 128, kernel_size=3, padding=1),  # features.8
            nn.BatchNorm2d(128),                           # features.9
            nn.ReLU(inplace=True),                         # features.10
            nn.AdaptiveAvgPool2d((1, 1)),                  # features.11
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),                                  # classifier.0
            nn.Linear(128, 64),                            # classifier.1
            nn.ReLU(inplace=True),                         # classifier.2
            nn.Dropout(0.5),                               # classifier.3
            nn.Linear(64, 1),                              # classifier.4
            nn.Sigmoid(),                                  # classifier.5
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        return self.classifier(x)
