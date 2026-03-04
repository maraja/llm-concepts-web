import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function ALiBiSlopeVisualizer() {
  const [numHeads, setNumHeads] = useState(8);
  const [selectedHead, setSelectedHead] = useState(0);
  const [seqLen, setSeqLen] = useState(8);

  const slopes = useMemo(() => {
    return Array.from({ length: numHeads }, (_, i) => {
      return Math.pow(2, -(8 / numHeads) * (i + 1));
    });
  }, [numHeads]);

  const biases = useMemo(() => {
    const slope = slopes[selectedHead];
    return Array.from({ length: seqLen }, (_, j) =>
      Array.from({ length: seqLen }, (_, i) => -slope * Math.abs(i - j))
    );
  }, [selectedHead, slopes, seqLen]);

  const minBias = Math.min(...biases.flat());

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          ALiBi: Attention Bias Matrix
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          ALiBi adds a linear distance penalty to attention scores. Each head has a different slope — steep slopes focus locally, gentle slopes attend far.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Heads</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numHeads}</span>
          </div>
          <input type="range" min={2} max={16} step={2} value={numHeads}
            onChange={e => { setNumHeads(Number(e.target.value)); setSelectedHead(0); }}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Seq length</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{seqLen}</span>
          </div>
          <input type="range" min={4} max={16} step={1} value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Head selector */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {slopes.map((s, i) => (
          <button key={i} onClick={() => setSelectedHead(i)} style={{
            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem',
            fontFamily: "'JetBrains Mono', monospace",
            border: `1px solid ${selectedHead === i ? '#C76B4A' : '#E5DFD3'}`,
            background: selectedHead === i ? '#C76B4A10' : 'transparent',
            color: selectedHead === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: selectedHead === i ? 600 : 400, cursor: 'pointer',
          }}>
            H{i} (m={s.toFixed(4)})
          </button>
        ))}
      </div>

      {/* Bias matrix */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Bias matrix for Head {selectedHead} (slope = {slopes[selectedHead].toFixed(4)})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `20px repeat(${seqLen}, 1fr)`, gap: '2px' }}>
          <div />
          {Array.from({ length: seqLen }, (_, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '0.5rem', color: '#7A8B7C' }}>{i}</div>
          ))}
          {biases.map((row, i) => (
            <>
              <div key={`l${i}`} style={{ display: 'flex', alignItems: 'center', fontSize: '0.5rem', color: '#7A8B7C' }}>{i}</div>
              {row.map((val, j) => {
                const intensity = minBias === 0 ? (val === 0 ? 1 : 0) : 1 - val / minBias;
                return (
                  <div key={`${i}-${j}`} style={{
                    aspectRatio: '1', borderRadius: '2px',
                    background: `rgba(139, 168, 136, ${intensity * 0.8 + 0.1})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.45rem', color: intensity > 0.5 ? '#FDFBF7' : '#5A6B5C',
                  }}>
                    {val.toFixed(1)}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        Diagonal = 0 (no penalty for self). Off-diagonal penalties grow linearly with distance. Steeper slopes = narrower attention.
      </div>
    </div>
  );
}
