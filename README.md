# 🔍 DeepShield — AI Deepfake & Manipulated Media Detector

> A real-time deepfake and image manipulation detection tool powered by deep learning.

**Built by [Yaswanth](mailto:yaswanthcheekatla9@gmail.com)**

---

## 🚀 What It Does

DeepShield analyzes uploaded images and videos to detect:

- **Deepfake Faces** — CNN-based face manipulation detection
- **GAN Artifacts** — Frequency-domain analysis to catch GAN fingerprints
- **Metadata Forensics** — EXIF data analysis and anomaly detection
- **Noise Pattern Analysis** — Error Level Analysis (ELA) to find edited regions
- **Confidence Heatmap** — Grad-CAM visualization highlighting suspicious regions
- **Detailed Report** — Downloadable forensics report for each scan

---

## 🧠 Tech Stack

### Frontend
- React 18 + Vite
- Canvas API (image rendering + heatmap overlay)
- Recharts (confidence charts)
- Framer Motion (animations)

### Backend
- Python + FastAPI
- PyTorch + torchvision (EfficientNet B4 for deepfake detection)
- OpenCV (image processing, ELA, noise analysis)
- Pillow (EXIF extraction and metadata parsing)
- NumPy + SciPy (frequency domain analysis via FFT)

---

## 📁 Project Structure

```
deepshield/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DropZone.jsx
│   │   │   ├── ResultPanel.jsx
│   │   │   ├── HeatmapViewer.jsx
│   │   │   └── MetadataPanel.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py
│   ├── detector.py
│   ├── ela_analyzer.py
│   ├── metadata_parser.py
│   ├── requirements.txt
│   └── models/
│       └── (model weights downloaded on first run)
└── README.md
```

---

## ⚙️ Setup & Run

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
> On first run, EfficientNet weights are auto-downloaded (~80MB).

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 🔬 How Detection Works

### 1. Face Deepfake Detection
- Extracts faces using MTCNN face detector
- Runs EfficientNet B4 (fine-tuned on FaceForensics++ dataset)
- Generates per-face confidence score (0–100%)

### 2. GAN Fingerprint Detection
- Applies 2D FFT on image to move to frequency domain
- GAN-generated images leave periodic spectral artifacts
- Detects "spectral peaks" characteristic of GAN upsampling

### 3. Error Level Analysis (ELA)
- Re-saves image at known JPEG quality
- Computes pixel-level difference
- High ELA values = recently edited or composited regions

### 4. Metadata Forensics
- Checks for missing/stripped EXIF data (common in AI-generated images)
- Flags mismatches between claimed and actual creation dates
- Identifies software fingerprints (e.g., Photoshop, Stable Diffusion)

---

## 📊 Confidence Scoring

```
Final Score = (
  Deepfake Model Score × 0.50 +
  GAN Artifact Score × 0.25 +
  ELA Anomaly Score × 0.15 +
  Metadata Anomaly Score × 0.10
)
```

Verdict:
- **0–30%**: Likely authentic
- **30–60%**: Suspicious — manual review recommended
- **60–100%**: Likely manipulated

---

## 🌟 Why This Project Stands Out

- Uses **real deep learning models** (EfficientNet on FF++ dataset)
- Multi-modal detection: combines CNN + frequency + forensics
- Addresses a **highly relevant real-world problem** (misinformation, fraud)
- Grad-CAM heatmap makes the model **explainable/interpretable**
- Full REST API with detailed JSON reports

---

## 📬 Contact

**Yaswanth Cheekatla**  
📧 yaswanthcheekatla9@gmail.com  
🔗 [GitHub](https://github.com/yaswanth)
