"""
Metadata Forensics Parser
Author: Yaswanth Cheekatla
Email: yaswanthcheekatla9@gmail.com

Analyzes EXIF metadata for signs of AI generation or manipulation.
"""

import io
from PIL import Image
from PIL.ExifTags import TAGS
from datetime import datetime


# Software strings that suggest AI generation or heavy editing
AI_SOFTWARE_SIGNATURES = [
    "stable diffusion", "midjourney", "dall-e", "dalle", "firefly",
    "runway", "deepdream", "generative", "ai image", "neural",
    "gan", "diffusion"
]

EDITING_SOFTWARE = [
    "photoshop", "lightroom", "gimp", "affinity", "pixlr",
    "snapseed", "facetune", "meitu"
]


class MetadataParser:
    def analyze(self, image_bytes: bytes, filename: str = "") -> dict:
        """Extract and analyze EXIF metadata"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            exif_data = self._extract_exif(image)
        except Exception:
            exif_data = {}

        missing_exif = len(exif_data) == 0
        software = exif_data.get("Software", "").lower()
        make = exif_data.get("Make", "")
        model_tag = exif_data.get("Model", "")
        date_original = exif_data.get("DateTimeOriginal", "")
        date_modified = exif_data.get("DateTime", "")

        # Check for AI software
        software_flag = None
        for sig in AI_SOFTWARE_SIGNATURES:
            if sig in software:
                software_flag = f"AI generation tool detected: {exif_data.get('Software', '')}"
                break
        if not software_flag:
            for sig in EDITING_SOFTWARE:
                if sig in software:
                    software_flag = f"Image editing software: {exif_data.get('Software', '')}"
                    break

        # Date anomaly: modified after original
        date_anomaly = False
        if date_original and date_modified:
            try:
                fmt = "%Y:%m:%d %H:%M:%S"
                dt_orig = datetime.strptime(date_original, fmt)
                dt_mod = datetime.strptime(date_modified, fmt)
                if dt_mod > dt_orig:
                    date_anomaly = True
            except Exception:
                pass

        # Score: more anomalies = higher score
        anomaly_score = 0
        if missing_exif:
            anomaly_score += 40
        if software_flag and "ai" in software_flag.lower():
            anomaly_score += 40
        elif software_flag:
            anomaly_score += 20
        if date_anomaly:
            anomaly_score += 15
        if not make and not model_tag:
            anomaly_score += 5

        anomaly_score = min(anomaly_score, 100)

        return {
            "anomaly_score": float(anomaly_score),
            "missing_exif": missing_exif,
            "software": exif_data.get("Software", "Unknown"),
            "camera_make": make or "Not found",
            "camera_model": model_tag or "Not found",
            "date_original": date_original or "Not found",
            "date_modified": date_modified or "Not found",
            "date_anomaly": date_anomaly,
            "software_flag": software_flag,
            "total_exif_fields": len(exif_data),
            "flags": self._collect_flags(missing_exif, software_flag, date_anomaly, make)
        }

    def _extract_exif(self, image: Image.Image) -> dict:
        """Extract EXIF tags as a readable dict"""
        exif_raw = image._getexif()
        if not exif_raw:
            return {}
        return {
            TAGS.get(tag, tag): str(value)
            for tag, value in exif_raw.items()
            if TAGS.get(tag, tag) in {
                "Software", "Make", "Model", "DateTimeOriginal",
                "DateTime", "Artist", "Copyright", "ImageDescription",
                "GPSInfo", "ColorSpace", "ExifImageWidth", "ExifImageHeight"
            }
        }

    def _collect_flags(self, missing_exif, software_flag, date_anomaly, make) -> list:
        flags = []
        if missing_exif:
            flags.append("⚠️ No EXIF data — AI-generated images typically lack metadata")
        if software_flag:
            flags.append(f"🖥️ {software_flag}")
        if date_anomaly:
            flags.append("📅 Modification date is later than original capture date")
        if not make:
            flags.append("📷 No camera make/model found")
        if not flags:
            flags.append("✅ Metadata appears consistent with authentic camera photo")
        return flags
