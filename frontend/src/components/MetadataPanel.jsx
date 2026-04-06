/**
 * Metadata Panel
 * Author: Yaswanth Cheekatla
 */

import { motion } from 'framer-motion'

export default function MetadataPanel({ meta }) {
  const rows = [
    { label: 'Camera Make', value: meta.camera_make },
    { label: 'Camera Model', value: meta.camera_model },
    { label: 'Software', value: meta.software },
    { label: 'Date Captured', value: meta.date_original },
    { label: 'Date Modified', value: meta.date_modified },
    { label: 'EXIF Fields Found', value: meta.total_exif_fields },
  ]

  return (
    <motion.div className="meta-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <h3>📋 Metadata Forensics</h3>

      <div className="meta-table">
        {rows.map(r => (
          <div key={r.label} className="meta-row">
            <span className="meta-key">{r.label}</span>
            <span className="meta-val">{r.value || '—'}</span>
          </div>
        ))}
      </div>

      <div className="meta-flags">
        {meta.flags.map((f, i) => (
          <motion.div
            key={i} className="meta-flag"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            {f}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
