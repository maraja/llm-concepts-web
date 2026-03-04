import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const SCENARIOS = [
  {
    context: 'The capital of France is',
    predictions: [{ tok: 'Paris', p: 0.92 }, { tok: 'a', p: 0.03 }, { tok: 'the', p: 0.02 }, { tok: 'located', p: 0.01 }],
    type: 'Factual recall — high confidence on one answer',
  },
  {
    context: 'She felt a sense of',
    predictions: [{ tok: 'relief', p: 0.25 }, { tok: 'dread', p: 0.18 }, { tok: 'wonder', p: 0.15 }, { tok: 'calm', p: 0.12 }],
    type: 'Creative/emotional — many plausible continuations',
  },
  {
    context: 'def fibonacci(n):',
    predictions: [{ tok: '\n', p: 0.45 }, { tok: ' ', p: 0.20 }, { tok: '#', p: 0.10 }, { tok: 'if', p: 0.08 }],
    type: 'Code — structural tokens (whitespace, keywords) dominate',
  },
  {
    context: 'The recipe calls for 2 cups of',
    predictions: [{ tok: 'flour', p: 0.35 }, { tok: 'sugar', p: 0.25 }, { tok: 'water', p: 0.12 }, { tok: 'milk', p: 0.10 }],
    type: 'Domain-specific — prior knowledge about cooking',
  },
];

export default function NextTokenPredictor() {
  const [selected, setSelected] = useState(0);
  const scenario = SCENARIOS[selected];
  const maxP = Math.max(...scenario.predictions.map(p => p.p));

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Next-Token Prediction in Action
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how the model's confidence varies across different types of predictions.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {SCENARIOS.map((s, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${selected === i ? '#C76B4A' : '#E5DFD3'}`,
            background: selected === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: selected === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: selected === i ? 600 : 400,
            fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {['Factual', 'Creative', 'Code', 'Domain'][i]}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.68rem', color: '#7A8B7C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Input: </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#2C3E2D' }}>
          {scenario.context}<span style={{ color: '#C76B4A', fontWeight: 600, borderBottom: '2px dashed #C76B4A' }}> ___</span>
        </span>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {scenario.predictions.map((pred) => {
          const isTop = pred.p === maxP;
          return (
            <div key={pred.tok} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 50px', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', textAlign: 'right',
                color: isTop ? '#C76B4A' : '#5A6B5C', fontWeight: isTop ? 600 : 400,
              }}>
                {pred.tok === '\n' ? '\\n' : pred.tok === ' ' ? '⎵' : pred.tok}
              </span>
              <div style={{ height: '22px', background: '#F0EBE1', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(pred.p / maxP) * 100}%`,
                  background: isTop ? 'linear-gradient(90deg, #C76B4A, #D4896D)' : '#8BA888',
                  borderRadius: '4px', transition: 'width 0.2s ease',
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: isTop ? '#C76B4A' : '#7A8B7C', textAlign: 'right', fontWeight: isTop ? 600 : 400 }}>
                {(pred.p * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C', fontStyle: 'italic' }}>
        {scenario.type}
      </div>
    </div>
  );
}
