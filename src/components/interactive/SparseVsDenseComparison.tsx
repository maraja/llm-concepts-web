import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function SparseVsDenseComparison() {
  const [seqLen, setSeqLen] = useState(4096);

  const data = useMemo(() => {
    const dense = seqLen * seqLen;
    const sparse = seqLen * Math.sqrt(seqLen);
    const linear = seqLen * 256;
    return [
      { name: 'Dense (Full)', ops: dense, color: '#C76B4A', complexity: 'O(n²)' },
      { name: 'Sparse', ops: sparse, color: '#D4A843', complexity: 'O(n√n)' },
      { name: 'Linear', ops: linear, color: '#8BA888', complexity: 'O(n·k)' },
    ];
  }, [seqLen]);

  const maxOps = Math.max(...data.map(d => d.ops));

  const formatOps = (n: number) => {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Sparse vs. Dense Scaling
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how compute requirements diverge as sequence length grows.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>Sequence Length</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>{seqLen.toLocaleString()}</span>
        </div>
        <input type="range" min={256} max={65536} step={256} value={seqLen}
          onChange={e => setSeqLen(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {data.map(d => (
          <div key={d.name} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 70px', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: d.color }}>{d.name}</div>
              <div style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#7A8B7C' }}>{d.complexity}</div>
            </div>
            <div style={{ height: '22px', background: '#F0EBE1', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${(d.ops / maxOps) * 100}%`,
                background: `linear-gradient(90deg, ${d.color}, ${d.color}99)`,
                borderRadius: '4px', transition: 'width 0.2s ease',
              }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#5A6B5C', textAlign: 'right' }}>{formatOps(d.ops)}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C', textAlign: 'center' }}>
        Sparse attention uses <strong style={{ color: '#3D5240' }}>{((1 - data[1].ops / data[0].ops) * 100).toFixed(0)}%</strong> fewer operations than dense at n={seqLen.toLocaleString()}
      </div>
    </div>
  );
}
