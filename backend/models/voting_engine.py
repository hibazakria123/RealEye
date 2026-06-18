from collections import Counter
from typing import Dict, List


AGREE_WEIGHT = 1.5
DISSENT_WEIGHT = 0.5


def majority_vote(predictions: List[Dict]) -> Dict:
    """
    Combine predictions from N models via majority voting.

    Each prediction must be a dict with at least:
        - "model_name": str
        - "prediction": str, "REAL" or "FAKE"
        - "confidence": float in [0, 1]

    Returns:
        {
            "final_prediction":    "REAL" | "FAKE",
            "weighted_confidence": float,    # agreeing 1.5x, dissenting 0.5x
            "avg_confidence":      float,
            "agreement":           int,      # count of models that agree
            "individual_votes":    [predictions...],
        }
    """
    if not predictions:
        raise ValueError("predictions must not be empty")

    labels = [p["prediction"] for p in predictions]
    counts = Counter(labels)
    final_prediction, agreement_count = counts.most_common(1)[0]

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
        "agreement": agreement_count,
        "individual_votes": predictions,
    }
