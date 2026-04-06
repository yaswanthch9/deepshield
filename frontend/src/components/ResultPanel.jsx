/**
 * Result Panel - Score Breakdown
 * Author: Yaswanth Cheekatla
 */

import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'

const ScoreBar = ({ label, score, color, delay = 0 }) => (
  <div className="score-bar-row">
    <div className="score-bar-label">
      <span>{label}</span>
      <span style={{ color }} className="score-val">{score.toFixed(1)}%</span>
    </div>
    <div className="score-bar-track">
      <motion.div
        className="score-bar-fill"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
    </div>
  </div>
)

export default function ResultPanel({ result }) {
  const { deepfake_analysis: df, ela_analysis: ela } = result

  const scores = [
    { label: 'CNN Deepfake Score', score: df.score, color: '#ef4444' },
    { label: 'GAN Artifact Score', score: df.gan_score, color: '#f97316' },
    { label: 'ELA Anomaly Score', score: ela.anomaly_score, color: '#f59e0b' },
    { label: 'Metadata Anomaly', score: result.metadata_analysis.anomaly_score, color: '#8b5cf6' },
  ]

  return (
    <motion.div className="result-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <h3>📊 Detection Breakdown</h3>

      <div className="score-bars">
        {scores.map((s, i) => (
          <ScoreBar key={s.label} {...s} delay={i * 0.1} />
        ))}
      </div>

      <div className="ela-stats">
        <h4>🔬 ELA Statistics</h4>
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-val">{ela.mean_ela_value}</span>
            <span className="stat-key">Mean ELA</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">{ela.max_ela_value}</span>
            <span className="stat-key">Max ELA</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">{ela.anomalous_percentage}%</span>
            <span className="stat-key">Anomalous Pixels</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">{df.faces_detected}</span>
            <span className="stat-key">Faces Found</span>
          </div>
        </div>
        <p className="ela-interp">{ela.interpretation}</p>
      </div>
    </motion.div>
  )
}
