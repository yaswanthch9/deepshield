"""
Error Level Analysis (ELA) — Image Manipulation Detection
Author: Yaswanth Cheekatla
Email: yaswanthcheekatla9@gmail.com

ELA works by re-saving an image at a known quality level and computing
the pixel-wise difference. Manipulated/composited regions stand out
because they compress at different rates.
"""

import io
import numpy as np
from PIL import Image, ImageChops, ImageEnhance


class ELAAnalyzer:
    def __init__(self, quality: int = 90, scale: int = 10):
        self.quality = quality
        self.scale = scale

    def analyze(self, image: Image.Image) -> dict:
        """Run ELA and return anomaly score and statistics"""
        ela_image = self._compute_ela(image)
        ela_array = np.array(ela_image).astype(float)

        # Compute statistics
        mean_ela = float(np.mean(ela_array))
        max_ela = float(np.max(ela_array))
        std_ela = float(np.std(ela_array))

        # Anomalous regions = pixels with ELA > threshold
        threshold = mean_ela + 2.5 * std_ela
        anomalous_mask = ela_array > threshold
        num_anomalous = int(np.sum(anomalous_mask.any(axis=2)) if ela_array.ndim == 3 else np.sum(anomalous_mask))
        total_pixels = image.width * image.height
        anomalous_pct = num_anomalous / total_pixels * 100

        # Anomaly score: normalized based on mean ELA and anomalous percentage
        anomaly_score = min((mean_ela / 255 * 100 * 0.6 + anomalous_pct * 0.4) * 2, 100)

        return {
            "anomaly_score": round(anomaly_score, 2),
            "mean_ela_value": round(mean_ela, 2),
            "max_ela_value": round(max_ela, 2),
            "std_ela_value": round(std_ela, 2),
            "num_anomalous_regions": num_anomalous,
            "anomalous_percentage": round(anomalous_pct, 2),
            "interpretation": self._interpret(anomaly_score)
        }

    def _compute_ela(self, image: Image.Image) -> Image.Image:
        """Core ELA computation"""
        # Save at reduced quality
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=self.quality)
        buffer.seek(0)
        recompressed = Image.open(buffer).convert("RGB")
        original = image.convert("RGB")

        # Compute difference
        diff = ImageChops.difference(original, recompressed)

        # Scale up for visibility
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema]) or 1
        scale = 255.0 / max_diff * self.scale
        diff = ImageEnhance.Brightness(diff).enhance(scale)
        return diff

    def _interpret(self, score: float) -> str:
        if score < 20:
            return "Image appears unmodified — ELA values are uniformly low"
        elif score < 50:
            return "Slight ELA anomalies detected — may be normal compression artifacts"
        else:
            return "Significant ELA anomalies — possible compositing or manipulation"
