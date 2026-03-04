import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const NORMS = [
  { name: 'Layer Norm', axis: 'Features (hidden dim)', batch: false, seq: false, feat: true, used: 'GPT, BERT, most LLMs', desc: 'Normalizes across features for each token independently. Works with any batch size.' },
  { name: 'Batch Norm', axis: 'Batch (across examples)', batch: true, seq: false, feat: false, used: 'CNNs, early vision models', desc: 'Normalizes across the batch. Requires large batches, problematic for variable-length sequences.' },
  { name: 'RMSNorm', axis: 'Features (simplified)', batch: false, seq: false, feat: true, used: 'LLaMA, Mistral, Gemma', desc: 'Like LayerNorm but without mean centering — just divides by root mean square. Faster.' },
  { name: 'Group Norm', axis: 'Feature groups', batch: false, seq: false, feat: true, used: 'Vision models', desc: 'Divides features into groups and normalizes within each group. Batch-size independent.' },
];

export default function NormalizationComparison() {
  const [selected, setSelected] = useState(0);
  const norm = NORMS[selected];

  // Simple visual: 4×6 grid of neurons, highlight what gets normalized together
  const grid = Array.from({ length: 4 }, (_, b) =>
    Array.from({ length: 6 }, (_, f) => {
      if (norm.name === 'Layer Norm' || norm.name === 'RMSNorm') return b === 1;
      if (norm.name === 'Batch Norm') return f === 2;
      if (norm.name === 'Group Norm') return b === 1 && f < 3;
      return false;
    })
  );

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Normalization Methods Compared
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare how different normalization methods select which values to normalize together.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {NORMS.map((n, i) => (
          <button key={n.name} onClick={() => setSelected(i)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${selected === i ? '#C76B4A' : '#E5DFD3'}`,
            background: selected === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: selected === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: selected === i ? 600 : 400,
            fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {n.name}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.65rem', color: '#7A8B7C' }}>
          <span>↓ Batch (tokens)</span>
          <span style={{ marginLeft: 'auto' }}>→ Features (hidden dimensions)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `30px repeat(6, 1fr)`, gap: '3px' }}>
          <div />
          {Array.from({ length: 6 }, (_, f) => (
            <div key={f} style={{ fontSize: '0.55rem', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', color: '#7A8B7C' }}>f{f}</div>
          ))}
          {grid.map((row, b) => (
            <>
              <div key={`l-${b}`} style={{ fontSize: '0.55rem', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', color: '#7A8B7C' }}>t{b}</div>
              {row.map((highlighted, f) => (
                <div key={`${b}-${f}`} style={{
                  aspectRatio: '1', borderRadius: '4px', minHeight: '28px',
                  background: highlighted ? '#C76B4A' : '#E5DFD3',
                  opacity: highlighted ? 1 : 0.5,
                  transition: 'all 0.15s ease',
                }} />
              ))}
            </>
          ))}
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#C76B4A', fontWeight: 600 }}>
          Highlighted cells are normalized together
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: '#F0EBE1', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.78rem', color: '#5A6B5C', marginBottom: '0.25rem' }}>
          <strong>{norm.name}</strong>: normalizes across <strong style={{ color: '#C76B4A' }}>{norm.axis}</strong>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C' }}>{norm.desc}</div>
        <div style={{ fontSize: '0.68rem', color: '#8BA888', marginTop: '0.3rem', fontStyle: 'italic' }}>Used in: {norm.used}</div>
      </div>
    </div>
  );
}
