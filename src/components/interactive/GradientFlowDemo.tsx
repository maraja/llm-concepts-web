import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function GradientFlowDemo() {
  const [depth, setDepth] = useState(12);
  const [hasResidual, setHasResidual] = useState(true);

  const gradients = useMemo(() => {
    const result = [];
    for (let i = depth; i >= 1; i--) {
      const withRes = Math.exp(-i * 0.03);
      const withoutRes = Math.exp(-i * 0.35);
      result.push({ layer: depth - i + 1, withRes, withoutRes });
    }
    return result;
  }, [depth]);

  const finalGrad = hasResidual ? gradients[gradients.length - 1].withRes : gradients[gradients.length - 1].withoutRes;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Gradient Flow Through Depth
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch how gradient magnitude changes as it flows backward through layers during training.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Network Depth</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{depth} layers</span>
          </div>
          <input type="range" min={2} max={48} step={2} value={depth}
            onChange={e => setDepth(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <button onClick={() => setHasResidual(!hasResidual)} style={{
          padding: '0.4rem 0.8rem', borderRadius: '6px',
          border: `1px solid ${hasResidual ? '#8BA888' : '#C76B4A'}`,
          background: hasResidual ? '#8BA88815' : '#C76B4A10',
          color: hasResidual ? '#3D5240' : '#C76B4A',
          fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>
          Skip: {hasResidual ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Gradient bars */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>
          Gradient magnitude (backward pass, layer {depth} → layer 1)
        </div>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'end', height: '60px' }}>
          {gradients.map((g, i) => {
            const val = hasResidual ? g.withRes : g.withoutRes;
            return (
              <div key={i} style={{
                flex: 1,
                height: `${Math.max(val * 100, 1)}%`,
                background: val > 0.5 ? '#8BA888' : val > 0.1 ? '#D4A843' : '#C76B4A',
                borderRadius: '2px 2px 0 0',
                transition: 'all 0.2s ease',
                minWidth: '2px',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.6rem', color: '#7A8B7C' }}>
          <span>Layer {depth} (output)</span>
          <span>Layer 1 (input)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Final Gradient</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: finalGrad > 0.5 ? '#3D5240' : finalGrad > 0.1 ? '#D4A843' : '#C76B4A' }}>
            {finalGrad.toFixed(4)}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: finalGrad > 0.5 ? '#3D5240' : finalGrad > 0.1 ? '#D4A843' : '#C76B4A' }}>
            {finalGrad > 0.5 ? 'Healthy' : finalGrad > 0.1 ? 'Weakening' : 'Vanishing!'}
          </div>
        </div>
      </div>
    </div>
  );
}
