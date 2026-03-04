import { useState } from 'react';

const N = 8;
const PATTERNS: Record<string, (i: number, j: number) => boolean> = {
  'Full Attention': (i, j) => j <= i,
  'Strided (every 2)': (i, j) => j <= i && (j % 2 === 0 || Math.abs(i - j) <= 1),
  'Fixed (local + global)': (i, j) => j <= i && (Math.abs(i - j) <= 2 || j === 0),
  'Block Sparse': (i, j) => j <= i && (Math.floor(i / 3) === Math.floor(j / 3) || j === 0),
};

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function SparsePatternVisualizer() {
  const [pattern, setPattern] = useState('Fixed (local + global)');
  const fn = PATTERNS[pattern];

  const totalCells = N * (N + 1) / 2;
  const activeCells = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => (j <= i && fn(i, j)) ? 1 : 0)
  ).flat().reduce((a, b) => a + b, 0);
  const sparsity = ((1 - activeCells / totalCells) * 100).toFixed(0);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Sparse Attention Patterns
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare different sparsity patterns. Colored cells show which positions each token attends to.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {Object.keys(PATTERNS).map(p => (
          <button key={p} onClick={() => setPattern(p)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${pattern === p ? '#C76B4A' : '#E5DFD3'}`,
            background: pattern === p ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: pattern === p ? '#C76B4A' : '#5A6B5C',
            fontWeight: pattern === p ? 600 : 400,
            fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `30px repeat(${N}, 1fr)`, gap: '2px', maxWidth: '360px', margin: '0 auto' }}>
          <div />
          {Array.from({ length: N }, (_, j) => (
            <div key={j} style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', color: '#7A8B7C' }}>{j}</div>
          ))}
          {Array.from({ length: N }, (_, i) => (
            <>
              <div key={`l-${i}`} style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A8B7C' }}>{i}</div>
              {Array.from({ length: N }, (_, j) => {
                const causal = j <= i;
                const active = causal && fn(i, j);
                return (
                  <div key={`${i}-${j}`} style={{
                    aspectRatio: '1',
                    borderRadius: '3px',
                    background: !causal ? '#E5DFD340' : active ? '#8BA888' : '#E5DFD3',
                    opacity: !causal ? 0.3 : 1,
                    transition: 'background 0.15s ease',
                    minHeight: '24px',
                  }} />
                );
              })}
            </>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Active Connections</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#8BA888' }}>{activeCells} / {totalCells}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Sparsity</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: Number(sparsity) > 30 ? '#C76B4A' : '#3D5240' }}>{sparsity}%</div>
        </div>
      </div>
    </div>
  );
}
