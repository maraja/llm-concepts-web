import { useState } from 'react';

const TOKENS = ['<BOS>', 'The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];

// Simulated attention weights showing the sink phenomenon
const LAYERS: Record<string, number[]> = {
  'Layer 1': [0.15, 0.12, 0.11, 0.10, 0.11, 0.10, 0.10, 0.08, 0.07, 0.06],
  'Layer 8': [0.25, 0.09, 0.08, 0.08, 0.09, 0.10, 0.09, 0.08, 0.07, 0.07],
  'Layer 16': [0.42, 0.06, 0.05, 0.05, 0.07, 0.09, 0.08, 0.07, 0.06, 0.05],
  'Layer 24': [0.58, 0.04, 0.03, 0.04, 0.05, 0.07, 0.06, 0.05, 0.04, 0.04],
  'Layer 32': [0.71, 0.03, 0.02, 0.02, 0.04, 0.05, 0.04, 0.04, 0.03, 0.02],
};

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function AttentionSinkHeatmap() {
  const [selectedLayer, setSelectedLayer] = useState('Layer 16');
  const weights = LAYERS[selectedLayer];
  const maxW = Math.max(...weights);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Attention Sink Phenomenon
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch how the first token absorbs disproportionate attention in deeper layers.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {Object.keys(LAYERS).map(l => (
          <button key={l} onClick={() => setSelectedLayer(l)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${selectedLayer === l ? '#C76B4A' : '#E5DFD3'}`,
            background: selectedLayer === l ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: selectedLayer === l ? '#C76B4A' : '#5A6B5C',
            fontWeight: selectedLayer === l ? 600 : 400,
            fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {TOKENS.map((tok, i) => {
          const w = weights[i];
          const isSink = i === 0;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '55px 1fr 50px', alignItems: 'center', gap: '0.6rem', padding: '0.3rem 0' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
                color: isSink ? '#C76B4A' : '#5A6B5C',
                fontWeight: isSink ? 700 : 400,
                textAlign: 'right',
              }}>
                {tok}
              </span>
              <div style={{ height: '22px', background: '#F0EBE1', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(w / maxW) * 100}%`,
                  background: isSink ? 'linear-gradient(90deg, #C76B4A, #D4896D)' : 'linear-gradient(90deg, #8BA888, #A8C4A5)',
                  borderRadius: '4px', transition: 'width 0.2s ease',
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: isSink ? '#C76B4A' : '#7A8B7C', textAlign: 'right', fontWeight: isSink ? 600 : 400 }}>
                {(w * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.75rem 1rem', background: '#C76B4A10', borderRadius: '8px', borderLeft: '3px solid #C76B4A', fontSize: '0.78rem', color: '#5A6B5C' }}>
        The first token (BOS) receives <strong style={{ color: '#C76B4A' }}>{(weights[0] * 100).toFixed(0)}%</strong> of attention in {selectedLayer} — it acts as a "sink" for residual attention mass, even though it carries minimal semantic information.
      </div>
    </div>
  );
}
