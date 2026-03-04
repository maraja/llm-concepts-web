import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function LayerNormVisualizer() {
  const [values, setValues] = useState([2.5, -1.0, 0.5, 4.0, -0.3]);
  const labels = ['dim₁', 'dim₂', 'dim₃', 'dim₄', 'dim₅'];

  const { normalized, mean, std } = useMemo(() => {
    const m = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
    const s = Math.sqrt(variance + 1e-5);
    return { normalized: values.map(v => (v - m) / s), mean: m, std: s };
  }, [values]);

  const maxAbs = Math.max(...values.map(Math.abs), ...normalized.map(Math.abs), 0.1);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Layer Normalization Step by Step
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Drag the sliders to adjust input values and see how LayerNorm centers and scales them.
        </p>
      </div>

      {/* Input sliders */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#C76B4A', marginBottom: '0.5rem' }}>Input (before norm)</div>
        {values.map((v, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '35px 1fr 40px', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#5A6B5C' }}>{labels[i]}</span>
            <input type="range" min={-5} max={5} step={0.1} value={v}
              onChange={e => { const next = [...values]; next[i] = parseFloat(e.target.value); setValues(next); }}
              style={{ width: '100%', height: '4px', appearance: 'none', WebkitAppearance: 'none', background: '#E5DFD3', borderRadius: '2px', cursor: 'pointer' }}
            />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: v >= 0 ? '#3D5240' : '#C76B4A', textAlign: 'right', fontWeight: 600 }}>
              {v >= 0 ? '+' : ''}{v.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ padding: '0.5rem 0.75rem', background: '#D4A84310', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Mean (μ)</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>{mean.toFixed(3)}</div>
        </div>
        <div style={{ padding: '0.5rem 0.75rem', background: '#D4A84310', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Std (σ)</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>{std.toFixed(3)}</div>
        </div>
      </div>

      {/* Output */}
      <div style={{ background: '#3D524008', borderRadius: '8px', padding: '1rem', border: '1px solid #8BA88820' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3D5240', marginBottom: '0.5rem' }}>Output (after norm) — mean ≈ 0, variance ≈ 1</div>
        {normalized.map((v, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '35px 1fr 50px', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#5A6B5C' }}>{labels[i]}</span>
            <div style={{ height: '16px', background: '#E5DFD3', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                left: v >= 0 ? '50%' : `${50 + (v / maxAbs) * 50}%`,
                width: `${Math.abs(v / maxAbs) * 50}%`,
                height: '100%',
                background: v >= 0 ? '#8BA888' : '#D4A843',
                borderRadius: '3px',
                transition: 'all 0.2s ease',
              }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#5A6B5C', textAlign: 'right' }}>
              {v >= 0 ? '+' : ''}{v.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
