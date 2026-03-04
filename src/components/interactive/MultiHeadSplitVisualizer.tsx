import { useState } from 'react';

const HEADS = [
  { id: 0, label: 'Head 1', focus: 'Syntactic (subject→verb)', color: '#C76B4A', weights: [0.1, 0.6, 0.2, 0.1] },
  { id: 1, label: 'Head 2', focus: 'Positional (nearby tokens)', color: '#D4A843', weights: [0.4, 0.3, 0.2, 0.1] },
  { id: 2, label: 'Head 3', focus: 'Semantic (noun→adjective)', color: '#8BA888', weights: [0.15, 0.15, 0.5, 0.2] },
  { id: 3, label: 'Head 4', focus: 'Copy/identity', color: '#6E8B6B', weights: [0.05, 0.05, 0.05, 0.85] },
];

const TOKENS = ['The', 'fluffy', 'cat', 'sat'];

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function MultiHeadSplitVisualizer() {
  const [activeHead, setActiveHead] = useState(0);
  const [dModel] = useState(512);
  const numHeads = HEADS.length;
  const dHead = dModel / numHeads;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Multi-Head Attention Split
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how the embedding is split across heads, each learning different attention patterns.
        </p>
      </div>

      {/* Dimension split visualization */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>
          <i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub>model</sub> = {dModel} → split into {numHeads} heads × <i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub>head</sub> = {dHead}
        </div>
        <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', gap: '2px' }}>
          {HEADS.map((h, i) => (
            <div
              key={h.id}
              onClick={() => setActiveHead(i)}
              style={{
                flex: 1, background: h.color, cursor: 'pointer',
                opacity: i === activeHead ? 1 : 0.35,
                transition: 'opacity 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', color: '#FDFBF7', fontWeight: 600,
              }}
            >
              {dHead}
            </div>
          ))}
        </div>
      </div>

      {/* Head selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {HEADS.map((h, i) => (
          <button key={h.id} onClick={() => setActiveHead(i)} style={{
            padding: '0.4rem 0.75rem', borderRadius: '6px',
            border: `1px solid ${activeHead === i ? h.color : '#E5DFD3'}`,
            background: activeHead === i ? h.color + '12' : 'transparent',
            color: activeHead === i ? h.color : '#5A6B5C',
            fontWeight: activeHead === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {h.label}
          </button>
        ))}
      </div>

      {/* Active head detail */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: HEADS[activeHead].color, marginBottom: '0.5rem' }}>
          {HEADS[activeHead].focus}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#7A8B7C', marginBottom: '0.75rem' }}>
          Attention weights for token "sat" (query) attending to all tokens:
        </div>
        {TOKENS.map((tok, j) => {
          const w = HEADS[activeHead].weights[j];
          return (
            <div key={tok} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 44px', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#5A6B5C', textAlign: 'right' }}>{tok}</span>
              <div style={{ height: '18px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${w * 100}%`, background: HEADS[activeHead].color, borderRadius: '3px', transition: 'width 0.2s ease' }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#7A8B7C' }}>{(w * 100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        After computing attention independently, all {numHeads} head outputs are <strong>concatenated</strong> back to <i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub>model</sub> = {dModel} and projected through <i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>W<sup>O</sup></i>.
      </div>
    </div>
  );
}
