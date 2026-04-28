import torch
import torch.nn as nn


class DeepCNN(nn.Module):
    """
    Three convolutional blocks followed by a fully-connected classifier.

    State dict layout (matches modelA.pth):
        block1.0  Conv2d(3, 32)
        block1.2  BatchNorm2d(32)
        block1.3  Conv2d(32, 32)
        block2.0  Conv2d(32, 64)
        block2.2  BatchNorm2d(64)
        block2.3  Conv2d(64, 64)
        block3.0  Conv2d(64, 128)
        block3.2  BatchNorm2d(128)
        block3.3  Conv2d(128, 128)
        classifier.1  Linear(128*28*28, 256)
        classifier.4  Linear(256, 1)
    """

    def __init__(self) -> None:
        super().__init__()

        self.block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),   # block1.0
            nn.ReLU(inplace=True),                         # block1.1
            nn.BatchNorm2d(32),                            # block1.2
            nn.Conv2d(32, 32, kernel_size=3, padding=1),  # block1.3
            nn.ReLU(inplace=True),                         # block1.4
            nn.MaxPool2d(2),                               # block1.5
            nn.Dropout(0.25),                              # block1.6
        )

        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),   # block2.0
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(64),                            # block2.2
            nn.Conv2d(64, 64, kernel_size=3, padding=1),   # block2.3
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout(0.25),
        )

        self.block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),  # block3.0
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(128),                           # block3.2
            nn.Conv2d(128, 128, kernel_size=3, padding=1), # block3.3
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout(0.25),
        )

        # After 3 max-pools on a 224x224 input -> 28x28 spatial size.
        self.classifier = nn.Sequential(
            nn.Flatten(),                                  # classifier.0
            nn.Linear(128 * 28 * 28, 256),                 # classifier.1
            nn.ReLU(inplace=True),                         # classifier.2
            nn.Dropout(0.5),                               # classifier.3
            nn.Linear(256, 1),                             # classifier.4
            nn.Sigmoid(),                                  # classifier.5
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        return self.classifier(x)
