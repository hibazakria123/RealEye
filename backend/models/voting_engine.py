from collections import Counter
from typing import Dict, List


AGREE_WEIGHT = 1.5
DISSENT_WEIGHT = 0.5


def majority_vote(predictions: List[Dict]) -> Dict:
    """
    Combine predictions from N models via majority voting.

    Each prediction must be a dict with at least:
        - "model":      str, model name
        - "prediction": str, "REAL" or "FAKE"
        - "confidence": float in [0, 1]

    Returns a dict with the final decision, weighted/average confidence,
    agreement ratio, and per-model votes.
    """
    if not predictions:
        raise ValueError("predictions must not be empty")

    labels = [p["prediction"] for p in predictions]
    counts = Counter(labels)
    final_prediction, top_count = counts.most_common(1)[0]
    agreement_ratio = top_count / len(predictions)

    weighted_sum = 0.0
    weight_total = 0.0
    for p in predictions:
        weight = AGREE_WEIGHT if p["prediction"] == final_prediction else DISSENT_WEIGHT
        weighted_sum += p["confidence"] * weight
        weight_total += weight

    weighted_confidence = weighted_sum / weight_total if weight_total else 0.0
    avg_confidence = sum(p["confidence"] for p in predictions) / len(predictions)

    return {
        "final_prediction": final_prediction,
        "weighted_confidence": round(weighted_confidence, 4),
        "avg_confidence": round(avg_confidence, 4),
        "agreement_ratio": round(agreement_ratio, 4),
        "votes": predictions,
    }
