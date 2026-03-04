import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function MoEEfficiencyCalculator() {
  const [numExperts, setNumExperts] = useState(8);
  const [topK, setTopK] = useState(2);
  const [denseParams, setDenseParams] = useState(7);

  const totalParams = useMemo(() => {
    const nonExpertRatio = 0.35;
    const expertParams = denseParams * (1 - nonExpertRatio) * numExperts;
    const sharedParams = denseParams * nonExpertRatio;
    return expertParams + sharedParams;
  }, [numExperts, denseParams]);

  const activeParams = useMemo(() => {
    const nonExpertRatio = 0.35;
    const activeExpertParams = denseParams * (1 - nonExpertRatio) * topK;
    const sharedParams = denseParams * nonExpertRatio;
    return activeExpertParams + sharedParams;
  }, [topK, denseParams]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          MoE Efficiency Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          MoE models have many parameters but only activate a fraction per token. Explore the tradeoff.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Dense equiv.', value: denseParams, set: setDenseParams, min: 1, max: 70, step: 1, fmt: (v: number) => `${v}B` },
          { label: 'Experts', value: numExperts, set: setNumExperts, min: 2, max: 64, step: 1, fmt: (v: number) => String(v) },
          { label: 'Top-K', value: topK, set: setTopK, min: 1, max: Math.min(8, numExperts), step: 1, fmt: (v: number) => String(v) },
        ].map(({ label, value, set, min, max, step, fmt }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{fmt(value)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total Params</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.15rem', fontWeight: 600, color: '#C76B4A' }}>{totalParams.toFixed(0)}B</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>stored in memory</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#8BA88808', borderRadius: '8px', textAlign: 'center', border: '1px solid #8BA88820' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Active Params</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.15rem', fontWeight: 600, color: '#3D5240' }}>{activeParams.toFixed(1)}B</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>compute per token</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Efficiency</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.15rem', fontWeight: 600, color: '#D4A843' }}>
            {((totalParams / activeParams)).toFixed(1)}×
          </div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>params/compute ratio</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        With {numExperts} experts (top-{topK}): <strong>{totalParams.toFixed(0)}B</strong> total parameters but only <strong>{activeParams.toFixed(1)}B</strong> active per token — <strong>{((totalParams / activeParams)).toFixed(1)}×</strong> more knowledge capacity per FLOP.
      </div>
    </div>
  );
}
