import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function RoPERotationVisualizer() {
  const [position, setPosition] = useState(3);
  const [dimPair, setDimPair] = useState(0);

  const theta = useMemo(() => {
    const base = 10000;
    const freq = 1 / Math.pow(base, (2 * dimPair) / 64);
    return position * freq;
  }, [position, dimPair]);

  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const angleDeg = (theta * 180) / Math.PI;

  // Original vector (unit vector pointing right)
  const origX = 0.4;
  const origY = 0;
  // Rotated vector
  const rotX = origX * cos - origY * sin;
  const rotY = origX * sin + origY * cos;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          RoPE: Rotation in Action
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          RoPE rotates each 2D pair of dimensions by an angle proportional to position. Different dimension pairs rotate at different frequencies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Position</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{position}</span>
          </div>
          <input type="range" min={0} max={20} step={1} value={position}
            onChange={e => setPosition(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Dim pair</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>d{dimPair * 2},{dimPair * 2 + 1}</span>
          </div>
          <input type="range" min={0} max={15} step={1} value={dimPair}
            onChange={e => setDimPair(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Rotation visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <svg viewBox="-0.6 -0.6 1.2 1.2" style={{ width: '100%', maxHeight: '200px' }}>
          {/* Grid */}
          <circle cx="0" cy="0" r="0.4" fill="none" stroke="#E5DFD3" strokeWidth="0.005" />
          <line x1="-0.5" y1="0" x2="0.5" y2="0" stroke="#E5DFD3" strokeWidth="0.003" />
          <line x1="0" y1="-0.5" x2="0" y2="0.5" stroke="#E5DFD3" strokeWidth="0.003" />

          {/* Original vector */}
          <line x1="0" y1="0" x2={origX} y2={-origY} stroke="#8BA888" strokeWidth="0.012" markerEnd="" />
          <circle cx={origX} cy={-origY} r="0.02" fill="#8BA888" />

          {/* Rotation arc */}
          {position > 0 && (
            <path
              d={`M ${origX * 0.6} 0 A 0.24 0.24 0 ${Math.abs(angleDeg) > 180 ? 1 : 0} ${angleDeg > 0 ? 0 : 1} ${rotX * 0.6} ${-rotY * 0.6}`}
              fill="none" stroke="#D4A843" strokeWidth="0.006" strokeDasharray="0.015 0.008"
            />
          )}

          {/* Rotated vector */}
          <line x1="0" y1="0" x2={rotX} y2={-rotY} stroke="#C76B4A" strokeWidth="0.012" />
          <circle cx={rotX} cy={-rotY} r="0.02" fill="#C76B4A" />

          {/* Labels */}
          <text x={origX + 0.04} y={0.02} fill="#8BA888" fontSize="0.05" fontFamily="Inter">original</text>
          <text x={rotX + 0.04} y={-rotY + 0.02} fill="#C76B4A" fontSize="0.05" fontFamily="Inter">rotated</text>
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Angle</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{angleDeg.toFixed(1)}°</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Frequency</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{dimPair === 0 ? 'High' : dimPair < 5 ? 'Medium' : 'Low'}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>cos θ, sin θ</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 600, color: '#D4A843' }}>{cos.toFixed(2)}, {sin.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
