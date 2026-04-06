/**
 * DeepShield — AI Deepfake Detector
 * Author: Yaswanth Cheekatla
 * Email: yaswanthcheekatla9@gmail.com
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Upload, AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react'
import ResultPanel from './components/ResultPanel'
import MetadataPanel from './components/MetadataPanel'
import axios from 'axios'
import './App.css'

export default function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP)')
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    handleFile(dropped)
  }, [])

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post('/api/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  const verdictIcon = result ? (
    result.verdict_color === 'green' ? <CheckCircle size={22} /> :
    result.verdict_color === 'yellow' ? <AlertTriangle size={22} /> :
    <XCircle size={22} />
  ) : null

  return (
    <div className="app">
      {/* Ambient background */}
      <div className="ambient" />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <Shield size={26} />
            <span>Deep<em>Shield</em></span>
          </div>
          <p className="tagline">AI-Powered Deepfake & Manipulation Detector</p>
          <div className="header-credit">by Yaswanth Cheekatla</div>
        </div>
      </header>

      <main className="main">
        {!result ? (
          <motion.div className="upload-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div
              className={`dropzone ${dragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !preview && document.getElementById('file-input').click()}
            >
              <input
                id="file-input" type="file" accept="image/*" hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {preview ? (
                <div className="preview-wrap">
                  <img src={preview} alt="Preview" className="preview-img" />
                  <div className="preview-overlay">
                    <span>{file?.name}</span>
                    <span>{(file?.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              ) : (
                <div className="drop-content">
                  <div className="drop-icon"><Upload size={40} /></div>
                  <h3>Drop an image to analyze</h3>
                  <p>Supports JPG, PNG, WebP — up to 10MB</p>
                  <span className="drop-hint">Click or drag & drop</span>
                </div>
              )}
            </div>

            {error && (
              <motion.div className="error-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ⚠️ {error}
              </motion.div>
            )}

            <div className="upload-actions">
              {preview && (
                <>
                  <button className="secondary-btn" onClick={reset}>Choose Different</button>
                  <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                    {loading ? (
                      <><Loader size={16} className="spin" /> Analyzing...</>
                    ) : (
                      <><Shield size={16} /> Run Forensic Analysis</>
                    )}
                  </button>
                </>
              )}
            </div>

            {loading && (
              <motion.div className="loading-steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {['🧠 Running CNN deepfake detection...', '🔬 Performing Error Level Analysis...', '📡 Analyzing frequency domain...', '📋 Parsing metadata...'].map((step, i) => (
                  <motion.div key={i} className="loading-step"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 }}>
                    {step}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* How it works */}
            <div className="how-it-works">
              <h3>How DeepShield Works</h3>
              <div className="method-grid">
                {[
                  { icon: '🧠', title: 'CNN Detection', desc: 'EfficientNet B4 trained on FaceForensics++ dataset analyzes facial patterns' },
                  { icon: '📡', title: 'GAN Fingerprints', desc: 'FFT frequency analysis detects spectral artifacts left by GAN upsampling' },
                  { icon: '🔬', title: 'Error Level Analysis', desc: 'Re-compression analysis reveals regions with inconsistent JPEG artifacts' },
                  { icon: '📋', title: 'Metadata Forensics', desc: 'EXIF data examination identifies AI tools, software traces, and date anomalies' },
                ].map((m) => (
                  <div key={m.title} className="method-card">
                    <div className="method-icon">{m.icon}</div>
                    <h4>{m.title}</h4>
                    <p>{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div className="results-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Verdict Banner */}
            <motion.div
              className={`verdict-banner ${result.verdict_color}`}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            >
              {verdictIcon}
              <div>
                <div className="verdict-label">Analysis Complete</div>
                <div className="verdict-text">{result.verdict}</div>
              </div>
              <div className="verdict-score">{result.overall_score}%</div>
            </motion.div>

            <div className="results-grid">
              {/* Left: image + summary */}
              <div className="results-left">
                <div className="result-image-wrap">
                  <img src={preview} alt="Analyzed" className="result-img" />
                  <div className="img-info">
                    <span>{result.filename}</span>
                    <span>{result.image_size.width} × {result.image_size.height}px</span>
                  </div>
                </div>

                <div className="summary-box">
                  <h3>🔍 Forensic Findings</h3>
                  <ul>
                    {result.summary.map((s, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                        {s}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <button className="secondary-btn full" onClick={reset}>← Analyze Another Image</button>
              </div>

              {/* Right: detailed scores */}
              <div className="results-right">
                <ResultPanel result={result} />
                <MetadataPanel meta={result.metadata_analysis} />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="footer">
        DeepShield v1.0 · Built by{' '}
        <a href="mailto:yaswanthcheekatla9@gmail.com">Yaswanth Cheekatla</a>
        {' '}· For educational & research purposes only
      </footer>
    </div>
  )
}
