import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function SinusoidalPositionDemo() {
  const [seqLen, setSeqLen] = useState(16);
  const [dimSelect, setDimSelect] = useState(0);

  const dims = [0, 1, 2, 3, 4, 5];
  const heatmap = useMemo(() => {
    const data: number[][] = [];
    for (let pos = 0; pos < seqLen; pos++) {
      const row: number[] = [];
      for (const d of dims) {
        const freq = 1 / Math.pow(10000, (2 * Math.floor(d / 2)) / 64);
        const val = d % 2 === 0 ? Math.sin(pos * freq) : Math.cos(pos * freq);
        row.push(val);
      }
      data.push(row);
    }
    return data;
  }, [seqLen]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Sinusoidal Position Encoding
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Each position gets a unique pattern of sine/cosine values. Lower dimensions have higher frequencies.
        </p>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Sequence length</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{seqLen}</span>
        </div>
        <input type="range" min={4} max={32} step={1} value={seqLen}
          onChange={e => setSeqLen(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
      </div>

      {/* Heatmap */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Position × Dimension (first 6 dims)
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
            <div style={{ height: '16px' }} />
            {heatmap.map((_, pos) => (
              <div key={pos} style={{ height: '16px', display: 'flex', alignItems: 'center', fontSize: '0.55rem', color: '#7A8B7C', width: '16px', justifyContent: 'flex-end' }}>
                {pos}
              </div>
            ))}
          </div>
          {dims.map((d, dIdx) => (
            <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              <div style={{ height: '16px', textAlign: 'center', fontSize: '0.55rem', color: dimSelect === dIdx ? '#C76B4A' : '#7A8B7C', fontWeight: dimSelect === dIdx ? 700 : 400, cursor: 'pointer' }}
                onClick={() => setDimSelect(dIdx)}>
                d{d}
              </div>
              {heatmap.map((row, pos) => {
                const val = row[dIdx];
                const r = val > 0 ? Math.round(199 + val * 56) : 199;
                const g = val > 0 ? Math.round(107 - val * 30) : Math.round(107 + Math.abs(val) * 61);
                const b = val > 0 ? Math.round(74 - val * 30) : Math.round(74 + Math.abs(val) * 62);
                return (
                  <div key={pos} style={{
                    height: '16px', borderRadius: '2px',
                    background: `rgb(${r}, ${g}, ${b})`,
                    border: dimSelect === dIdx ? '1px solid #2C3E2D40' : '1px solid transparent',
                  }} />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Warm = positive</span><span>Cool = negative</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Property</div>
          <div style={{ fontSize: '0.75rem', color: '#5A6B5C', marginTop: '0.2rem' }}>Each position has a unique pattern — like a fingerprint</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Limitation</div>
          <div style={{ fontSize: '0.75rem', color: '#5A6B5C', marginTop: '0.2rem' }}>Fixed, non-learnable; poor extrapolation beyond training length</div>
        </div>
      </div>
    </div>
  );
}
