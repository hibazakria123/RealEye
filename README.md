# RealEye — Deepfake Detection System

Upload an image. Get: **Real or Fake?** Plus — *which facial regions look synthetic.*

---

## The Problem

Standard deepfake detectors use a single model. They fail when the generation method changes. A model trained on GAN outputs collapses on diffusion-generated faces — because the artifacts are different.

---

## What RealEye Does

**3-model ensemble that tells you WHERE the synthetic artifacts are.**

- **ModelA** — Deep CNN (12 layers, 50×50 resolution)
- **ModelB** — Lightweight CNN (6 layers, 50×50 resolution)  
- **ModelC** — CNN + Vision Transformer hybrid (224×224 resolution)

**Majority voting** across all three models.  
**5-region facial scoring** — Eyes, Nose, Mouth, Left Side, Right Side.

**Test accuracy: 96.79%** on 8,000 held-out images from [Hemg/deepfake-and-real-images](https://huggingface.co/datasets/Hemg/deepfake-and-real-images).

---

## Get Started

**Requirements:** Python 3.9+, Node.js 18+

```bash
# Clone repo
git clone https://github.com/hibazakria123/RealEye 
cd RealEye

# Backend
pip install -r backend/requirements.txt
cd backend
uvicorn app:app --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**. Upload a face image.

---

## API Endpoint

**POST** `/detect`

**Request:**
```json
{
  "image": "<base64-encoded image>"
}
```

**Response:**
```json
{
  "label": "FAKE",
  "confidence": 94.3,
  "model_scores": {
    "modelA": 91.2,
    "modelB": 96.7,
    "modelC": 95.0
  },
  "region_scores": {
    "Eyes": 88.4,
    "Nose": 71.2,
    "Mouth": 94.9,
    "Left Side": 62.3,
    "Right Side": 89.1
  }
}
```

---

## How It Works

Input → Resize to 50×50 and 224×224 → Run through 3 models → Majority vote → 5-region breakdown

---

## Training

- **Dataset:** 190,335 images (Hemg/deepfake-and-real-images)
- **Framework:** PyTorch, timm library
- **Environment:** Kaggle (T4/P100 GPU)
- **Training time:** ~40 epochs per model

---

## Project Status

| Component | Status |
|-----------|--------|
| GAN detection ensemble | ✅ Done |
| Per-region scoring | ✅ Done |
| FastAPI backend | ✅ Done |
| Next.js frontend | ✅ Done |
| Model weights | ✅ Included |
| Docker deployment | ⏳ Planned |

---

## Known Limitations

- ModelC: CNN branch extracts features but ViT handles final classification independently — full fusion not implemented
- No data augmentation during training
- Test sets not perfectly aligned across models
- No validation split (train/test only)

---

## Tech Stack

**Backend:** FastAPI · PyTorch · timm  
**Frontend:** Next.js · TypeScript · Tailwind CSS  
**Training:** Kaggle Notebooks

---

## Author

Hiba — Final Year CS Student, Lahore Garrison University
