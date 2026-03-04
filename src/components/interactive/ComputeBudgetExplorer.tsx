import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function ComputeBudgetExplorer() {
  const [numLayers, setNumLayers] = useState(32);
  const [modLayers, setModLayers] = useState(16);
  const [capacityRatio, setCapacityRatio] = useState(0.5);

  const standardFLOPs = numLayers;
  const modFLOPs = useMemo(() => {
    const fullLayers = numLayers - modLayers;
    const partialLayers = modLayers * capacityRatio;
    return fullLayers + partialLayers;
  }, [numLayers, modLayers, capacityRatio]);

  const savings = ((1 - modFLOPs / standardFLOPs) * 100).toFixed(1);
  const speedup = (standardFLOPs / modFLOPs).toFixed(2);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          MoD Compute Budget
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Configure how many layers use Mixture-of-Depths routing and the per-layer capacity ratio.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Layers', value: numLayers, set: setNumLayers, min: 4, max: 96, step: 4 },
          { label: 'MoD Layers', value: modLayers, set: (v: number) => setModLayers(Math.min(v, numLayers)), min: 0, max: numLayers, step: 1 },
          { label: 'Capacity %', value: capacityRatio * 100, set: (v: number) => setCapacityRatio(v / 100), min: 10, max: 100, step: 5 },
        ].map(({ label, value, set, min, max, step }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{typeof value === 'number' ? Math.round(value) : value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      {/* Layer visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Layer compute allocation</div>
        <div style={{ display: 'flex', gap: '2px', height: '30px' }}>
          {Array.from({ length: numLayers }, (_, i) => {
            const isMoD = i >= numLayers - modLayers;
            return (
              <div key={i} style={{
                flex: 1,
                background: isMoD ? '#D4A843' : '#8BA888',
                borderRadius: '2px',
                opacity: isMoD ? capacityRatio : 1,
                transition: 'all 0.2s ease',
                minWidth: '2px',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.6rem', color: '#7A8B7C' }}>
          <span>Layer 1</span>
          <span style={{ color: '#8BA888' }}>{numLayers - modLayers} full</span>
          <span style={{ color: '#D4A843' }}>{modLayers} MoD</span>
          <span>Layer {numLayers}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>FLOP Savings</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{savings}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Speedup</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{speedup}×</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Effective Depth</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{modFLOPs.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}
