import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const SOURCE = ['Le', 'chat', 'est', 'assis'];
const TARGET = ['The', 'cat', 'is', 'sitting'];

const CROSS_ATTN: number[][] = [
  [0.7, 0.1, 0.1, 0.1],
  [0.05, 0.8, 0.1, 0.05],
  [0.1, 0.05, 0.75, 0.1],
  [0.05, 0.1, 0.1, 0.75],
];

export default function CrossAttentionFlow() {
  const [selectedTarget, setSelectedTarget] = useState(1);

  const weights = CROSS_ATTN[selectedTarget];
  const maxW = Math.max(...weights);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Cross-Attention in Translation
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Click a target word to see which source words it attends to via cross-attention.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ background: '#8BA88810', borderRadius: '8px', padding: '0.75rem', border: '1px solid #8BA88820' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Source (Encoder)</div>
          {SOURCE.map((tok, i) => (
            <div key={i} style={{
              padding: '0.3rem 0.5rem', marginBottom: '0.25rem', borderRadius: '4px',
              background: weights[i] === maxW ? '#8BA88830' : 'transparent',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem',
              color: '#2C3E2D', fontWeight: weights[i] === maxW ? 600 : 400,
              display: 'flex', justifyContent: 'space-between',
              transition: 'all 0.15s ease',
            }}>
              <span>{tok}</span>
              <span style={{ fontSize: '0.68rem', color: '#7A8B7C' }}>{(weights[i] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>K,V</span>
          <span style={{ fontSize: '1.2rem', color: '#D4A843' }}>→</span>
          <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Q</span>
        </div>

        <div style={{ background: '#C76B4A08', borderRadius: '8px', padding: '0.75rem', border: '1px solid #C76B4A20' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Target (Decoder)</div>
          {TARGET.map((tok, i) => (
            <button key={i} onClick={() => setSelectedTarget(i)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '0.3rem 0.5rem', marginBottom: '0.25rem', borderRadius: '4px',
              border: selectedTarget === i ? '1px solid #C76B4A' : '1px solid transparent',
              background: selectedTarget === i ? '#C76B4A15' : 'transparent',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem',
              color: selectedTarget === i ? '#C76B4A' : '#2C3E2D',
              fontWeight: selectedTarget === i ? 600 : 400,
              cursor: 'pointer',
            }}>
              {tok}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C', textAlign: 'center' }}>
        Generating "<strong style={{ color: '#C76B4A' }}>{TARGET[selectedTarget]}</strong>" — Query comes from the decoder, Keys & Values come from the encoder representation of "<strong style={{ color: '#8BA888' }}>{SOURCE[weights.indexOf(maxW)]}</strong>"
      </div>
    </div>
  );
}
