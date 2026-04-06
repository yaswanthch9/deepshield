"""
DeepShield — Deepfake & Manipulated Media Detector API
Author: Yaswanth Cheekatla
Email: yaswanthcheekatla9@gmail.com
"""

import io
import base64
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import uvicorn

from detector import DeepfakeDetector
from ela_analyzer import ELAAnalyzer
from metadata_parser import MetadataParser

app = FastAPI(
    title="DeepShield API",
    description="AI-powered deepfake and image manipulation detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = DeepfakeDetector()
ela = ELAAnalyzer()
meta_parser = MetadataParser()

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_SIZE_MB = 10


@app.get("/")
def root():
    return {
        "project": "DeepShield",
        "description": "AI Deepfake & Manipulated Media Detector",
        "author": "Yaswanth Cheekatla",
        "email": "yaswanthcheekatla9@gmail.com",
        "version": "1.0.0",
        "endpoints": ["/analyze", "/health"]
    }


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze an image for deepfake/manipulation indicators.
    Returns comprehensive forensics report.
    """
    # Validate
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported format. Allowed: {ALLOWED_TYPES}")

    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large. Max size: {MAX_SIZE_MB}MB")

    try:
        image = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Could not open image. File may be corrupted.")

    # Run all analyses
    deepfake_result = detector.analyze(image)
    ela_result = ela.analyze(image)
    meta_result = meta_parser.analyze(content, file.filename)

    # Compute weighted final score
    final_score = (
        deepfake_result["score"] * 0.50 +
        ela_result["anomaly_score"] * 0.25 +
        deepfake_result.get("gan_score", 0) * 0.15 +
        meta_result["anomaly_score"] * 0.10
    )
    final_score = round(min(final_score, 100), 2)

    verdict = (
        "LIKELY AUTHENTIC" if final_score < 30
        else "SUSPICIOUS" if final_score < 60
        else "LIKELY MANIPULATED"
    )
    verdict_color = (
        "green" if final_score < 30
        else "yellow" if final_score < 60
        else "red"
    )

    return {
        "filename": file.filename,
        "overall_score": final_score,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "image_size": {"width": image.width, "height": image.height},
        "deepfake_analysis": deepfake_result,
        "ela_analysis": ela_result,
        "metadata_analysis": meta_result,
        "summary": _build_summary(final_score, deepfake_result, ela_result, meta_result),
    }


def _build_summary(score, deepfake, ela, meta):
    flags = []
    if deepfake["score"] > 50:
        flags.append(f"CNN model detected face manipulation with {deepfake['score']:.1f}% confidence")
    if deepfake.get("gan_score", 0) > 40:
        flags.append("Spectral analysis detected GAN-like frequency artifacts")
    if ela["anomaly_score"] > 50:
        flags.append(f"Error Level Analysis found {ela['num_anomalous_regions']} suspicious regions")
    if meta["missing_exif"]:
        flags.append("Image has no EXIF data (common in AI-generated images)")
    if meta.get("software_flag"):
        flags.append(f"Software metadata suggests: {meta['software_flag']}")
    if not flags:
        flags.append("No significant manipulation indicators found")
    return flags


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": detector.model_loaded}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
