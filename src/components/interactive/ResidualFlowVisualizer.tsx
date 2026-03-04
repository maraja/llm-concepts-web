import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const LAYERS = ['Input', 'Attention', 'FFN', 'Attention', 'FFN', 'Output'];

export default function ResidualFlowVisualizer() {
  const [hasResidual, setHasResidual] = useState(true);
  const [numLayers, setNumLayers] = useState(4);

  const getSignalStrength = (layerIdx: number) => {
    if (hasResidual) return Math.max(1 - layerIdx * 0.05, 0.6);
    return Math.max(1 - layerIdx * 0.25, 0.02);
  };

  const activeLayers = LAYERS.slice(0, numLayers + 2);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Residual Connection Flow
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Toggle residual connections to see how they preserve signal through deep networks.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <button onClick={() => setHasResidual(!hasResidual)} style={{
          padding: '0.4rem 1rem', borderRadius: '6px',
          border: `1px solid ${hasResidual ? '#8BA888' : '#C76B4A'}`,
          background: hasResidual ? '#8BA88815' : '#C76B4A10',
          color: hasResidual ? '#3D5240' : '#C76B4A',
          fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>
          Residuals: {hasResidual ? 'ON' : 'OFF'}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#5A6B5C' }}>Depth</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#C76B4A' }}>{numLayers} layers</span>
          </div>
          <input type="range" min={1} max={4} step={1} value={numLayers}
            onChange={e => setNumLayers(Number(e.target.value))}
            style={{ width: '100%', height: '4px', appearance: 'none', WebkitAppearance: 'none', background: '#E5DFD3', borderRadius: '2px', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem' }}>
        {activeLayers.map((layer, i) => {
          const strength = getSignalStrength(i);
          const isEndpoint = i === 0 || i === activeLayers.length - 1;
          return (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: '#5A6B5C', width: '70px', textAlign: 'right' }}>{layer}</span>
                <div style={{ flex: 1, height: '24px', background: '#E5DFD3', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%', width: `${strength * 100}%`,
                    background: strength > 0.5 ? '#8BA888' : strength > 0.2 ? '#D4A843' : '#C76B4A',
                    borderRadius: '4px', transition: 'all 0.3s ease',
                  }} />
                  {hasResidual && !isEndpoint && (
                    <div style={{
                      position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '0.55rem', color: '#3D5240', fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      +skip
                    </div>
                  )}
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#7A8B7C', width: '38px' }}>{(strength * 100).toFixed(0)}%</span>
              </div>
              {i < activeLayers.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.1rem 0' }}>
                  <span style={{ width: '70px' }} />
                  <div style={{ color: '#7A8B7C', fontSize: '0.7rem', textAlign: 'center', flex: 1 }}>↓</div>
                  <span style={{ width: '38px' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.75rem 1rem', background: hasResidual ? '#8BA88810' : '#C76B4A10', borderRadius: '8px', borderLeft: `3px solid ${hasResidual ? '#8BA888' : '#C76B4A'}`, fontSize: '0.78rem', color: '#5A6B5C' }}>
        {hasResidual
          ? <>With residuals: signal preserves <strong style={{ color: '#3D5240' }}>{(getSignalStrength(activeLayers.length - 1) * 100).toFixed(0)}%</strong> strength through {numLayers} layers — <code style={{ fontSize: '0.75rem' }}>output = x + F(x)</code></>
          : <>Without residuals: signal degrades to <strong style={{ color: '#C76B4A' }}>{(getSignalStrength(activeLayers.length - 1) * 100).toFixed(0)}%</strong> — gradients vanish in deep networks.</>
        }
      </div>
    </div>
  );
}
