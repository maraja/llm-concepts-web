import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function NoiseReductionDemo() {
  const [noiseLevel, setNoiseLevel] = useState(0.3);

  const signal = [0.8, 0.1, 0.05, 0.03, 0.02];
  const labels = ['relevant', 'context', 'filler', 'noise₁', 'noise₂'];

  const noisy = useMemo(() => {
    const raw = signal.map((s, i) => s + (i > 1 ? noiseLevel * (0.3 - i * 0.05) : 0));
    const sum = raw.reduce((a, b) => a + b, 0);
    return raw.map(v => Math.max(v / sum, 0));
  }, [noiseLevel]);

  const cleaned = useMemo(() => {
    const raw = signal.map((s, i) => Math.max(s - noiseLevel * 0.15, 0));
    const sum = raw.reduce((a, b) => a + b, 0) || 1;
    return raw.map(v => v / sum);
  }, [noiseLevel]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Noise Cancellation Effect
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Standard attention spreads weight to irrelevant tokens. Differential attention cancels this noise.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>Noise Level</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>{(noiseLevel * 100).toFixed(0)}%</span>
        </div>
        <input type="range" min={0} max={0.8} step={0.05} value={noiseLevel}
          onChange={e => setNoiseLevel(parseFloat(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {/* Standard attention */}
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#C76B4A', marginBottom: '0.5rem' }}>Standard Attention</div>
          {labels.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0' }}>
              <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", width: '50px', color: '#5A6B5C', textAlign: 'right' }}>{label}</span>
              <div style={{ flex: 1, height: '14px', background: '#E5DFD3', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${noisy[i] * 100}%`, background: i < 2 ? '#D4A843' : '#C76B4A60', borderRadius: '2px', transition: 'width 0.2s ease' }} />
              </div>
              <span style={{ fontSize: '0.58rem', fontFamily: "'JetBrains Mono', monospace", color: '#7A8B7C', width: '28px' }}>{(noisy[i] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>

        {/* Differential attention */}
        <div style={{ background: '#3D524008', borderRadius: '8px', padding: '0.75rem', border: '1px solid #8BA88820' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3D5240', marginBottom: '0.5rem' }}>Differential Attention</div>
          {labels.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0' }}>
              <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", width: '50px', color: '#5A6B5C', textAlign: 'right' }}>{label}</span>
              <div style={{ flex: 1, height: '14px', background: '#E5DFD3', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${cleaned[i] * 100}%`, background: '#8BA888', borderRadius: '2px', transition: 'width 0.2s ease' }} />
              </div>
              <span style={{ fontSize: '0.58rem', fontFamily: "'JetBrains Mono', monospace", color: '#7A8B7C', width: '28px' }}>{(cleaned[i] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C', textAlign: 'center' }}>
        Signal-to-noise ratio: Standard <strong style={{ color: '#C76B4A' }}>{(noisy[0] / (noisy.slice(2).reduce((a, b) => a + b, 0) || 0.01)).toFixed(1)}:1</strong> → Differential <strong style={{ color: '#3D5240' }}>{(cleaned[0] / (cleaned.slice(2).reduce((a, b) => a + b, 0) || 0.01)).toFixed(1)}:1</strong>
      </div>
    </div>
  );
}
