from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(title="VocaVision Python AI Service")


class VisualPayload(BaseModel):
    visualSignals: dict[str, Any] = {}


@app.get("/health")
def health():
    return {"ok": True, "service": "python-ai-service"}


@app.post("/analyze-visuals")
def analyze_visuals(payload: VisualPayload):
    """Replace this stub with OpenCV/MediaPipe frame analysis."""
    signals = payload.visualSignals
    attention = int(signals.get("eyeContact", 86))
    posture = int(signals.get("posture", 88))
    confidence = int(signals.get("confidence", 91))
    return {
        "attention": max(0, min(attention, 100)),
        "posture": max(0, min(posture, 100)),
        "confidence": max(0, min(confidence, 100)),
        "notes": [
            "Stable face position",
            "Good visual engagement",
            "No severe distraction detected",
        ],
    }
