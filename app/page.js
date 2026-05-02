'use client'

import { useState } from 'react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [shotType, setShotType] = useState('open_play')
  const [distance, setDistance] = useState('inside_box')
  const [outcome, setOutcome] = useState('goal_top_corner')

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      setResult(null)
      setError(null)
    } else {
      alert('Please select a video file')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) { alert('Please select a video first'); return }
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('shotType', shotType)
      formData.append('distance', distance)
      formData.append('outcome', outcome)
      const response = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await response.json()
      if (response.ok) { setResult(data) } else { setError(data.error || 'Analysis failed') }
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const RubricBar = ({ label, score }) => {
    const pct = (score / 20) * 100
    const color = pct >= 80 ? '#4ade80' : pct >= 60 ? '#facc15' : '#f87171'
    return (
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#f1f5f9' }}>{score}/20</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.8s ease' }}></div>
        </div>
      </div>
    )
  }

  const selectStyle = {
    width: '100%',
    fontSize: '13px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9',
    outline: 'none',
    cursor: 'pointer',
  }

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 500,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    display: 'block',
    marginBottom: '6px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #0f1b4d 0%, #060b1a 50%, #000510 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #3b5bdb, #5c7cfa)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
            }}>⚽</div>
            <span style={{ fontSize: '26px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>ShotMetric</span>
          </div>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Upload your shot. Get professional AI coaching.</p>
        </div>

        {!result ? (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
          }}>
            {/* Upload zone */}
            <div
              onClick={() => document.getElementById('video-upload').click()}
              style={{
                border: '1.5px dashed rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '2.5rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                transition: 'border-color 0.2s',
                background: selectedFile ? 'rgba(59,91,219,0.08)' : 'transparent',
              }}
            >
              <input type="file" accept="video/*" onChange={handleFileSelect} style={{ display: 'none' }} id="video-upload" />
              <div style={{ fontSize: '36px', marginBottom: '0.75rem' }}>📹</div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>
                {selectedFile ? selectedFile.name : 'Drop your video here'}
              </p>
              <p style={{ fontSize: '12px', color: '#475569' }}>MP4, MOV or WebM · max 100MB</p>
            </div>

            {/* Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Shot type</label>
                <select value={shotType} onChange={e => setShotType(e.target.value)} style={selectStyle}>
                  <option value="open_play">Open play</option>
                  <option value="free_kick">Free kick</option>
                  <option value="penalty">Penalty</option>
                  <option value="volley">Volley</option>
                  <option value="header">Header</option>
                  <option value="long_range">Long range</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Distance</label>
                <select value={distance} onChange={e => setDistance(e.target.value)} style={selectStyle}>
                  <option value="inside_box">Inside box</option>
                  <option value="edge_box">Edge of box</option>
                  <option value="long_range">Long range</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Outcome</label>
                <select value={outcome} onChange={e => setOutcome(e.target.value)} style={selectStyle}>
                  <option value="goal_top_corner">Goal · top corner</option>
                  <option value="goal_bottom_corner">Goal · bottom corner</option>
                  <option value="goal_center">Goal · center</option>
                  <option value="saved">Saved</option>
                  <option value="post_bar">Post or bar</option>
                  <option value="missed_wide">Missed · wide</option>
                  <option value="missed_high">Missed · high</option>
                </select>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              style={{
                width: '100%',
                padding: '13px',
                background: !selectedFile || uploading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #3b5bdb, #5c7cfa)',
                color: !selectedFile || uploading ? '#475569' : 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
                letterSpacing: '-0.01em',
              }}
            >
              {uploading ? 'Analyzing...' : 'Analyze my shot'}
            </button>
          </div>

        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
          }}>
            {/* Score header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Overall score</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '52px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.03em' }}>{result.score}</span>
                  <span style={{ fontSize: '20px', color: '#475569', fontWeight: 500 }}>/100</span>
                </div>
                {result.shotType && <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{result.shotType}</p>}
              </div>
              <div style={{
                width: '80px', height: '80px',
                borderRadius: '50%',
                background: `conic-gradient(#3b5bdb ${result.score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#060b1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '24px' }}>⚽</span>
                </div>
              </div>
            </div>

            {/* Rubric */}
            {result.rubric && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Breakdown</p>
                <RubricBar label="Power" score={result.rubric.power} />
                <RubricBar label="Accuracy" score={result.rubric.accuracy} />
                <RubricBar label="Body positioning" score={result.rubric.bodyPositioning} />
                <RubricBar label="Foot technique" score={result.rubric.footTechnique} />
                <RubricBar label="Shot difficulty" score={result.rubric.shotDifficulty} />
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0' }}></div>

            {/* Feedback */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strengths</span>
                </div>
                {result.strengths && result.strengths.map((s, i) => (
                  <p key={i} style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '8px' }}>· {s}</p>
                ))}
              </div>
              <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24' }}></div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To improve</span>
                </div>
                {result.improvements && result.improvements.map((imp, i) => (
                  <p key={i} style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '8px' }}>· {imp}</p>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setResult(null); setSelectedFile(null); setError(null) }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: '#64748b',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Analyze another shot
            </button>
          </div>
        )}
      </div>
    </div>
  )
}