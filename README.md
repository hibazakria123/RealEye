# DeepGuard

Deepfake image detection using a 3-model PyTorch ensemble with majority voting.

## Architecture

| Model      | File                          | Backbone                                                | Weights        |
| ---------- | ----------------------------- | ------------------------------------------------------- | -------------- |
| DeepCNN    | `backend/models/deep_cnn.py`   | 3 conv blocks + FC head                                | `modelA.pth`   |
| FocusCNN   | `backend/models/focus_cnn.py`  | Lightweight CNN with adaptive avg pooling              | `modelB.pth`   |
| HybridNet  | `backend/models/hybrid_net.py` | timm `vit_base_patch16_224.augreg2_in21k_ft_in1k` head | `modelC.pth` (optional) |

A voting engine (`backend/models/voting_engine.py`) combines the three sigmoid
outputs via majority vote, weighting agreeing models 1.5× and dissenters 0.5×.

## Project layout

```
deepguard/
├── backend/
│   ├── app.py
│   ├── models/
│   │   ├── deep_cnn.py
│   │   ├── focus_cnn.py
│   │   ├── hybrid_net.py
│   │   └── voting_engine.py
│   ├── weights/        # drop modelA.pth / modelB.pth / modelC.pth here
│   └── requirements.txt
├── frontend/           # (placeholder)
└── README.md
```

## Running the backend

```bash
cd backend
pip install -r requirements.txt
# put modelA.pth and modelB.pth into ./weights
uvicorn app:app --reload --port 8000
```

### Endpoints

- `GET /health` — service status and which models are loaded
- `POST /detect` — multipart upload (`file`) of an image; returns the
  per-model votes and the final majority decision

### Conventions

- Input is preprocessed to 224×224, ImageNet mean/std normalized.
- A sigmoid output > 0.5 is interpreted as **FAKE**, ≤ 0.5 as **REAL**.
- Confidence reported is `prob` for FAKE and `1 - prob` for REAL.

If `modelC.pth` is absent, HybridNet falls back to the pretrained ViT.
