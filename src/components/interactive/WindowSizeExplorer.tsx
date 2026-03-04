import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function WindowSizeExplorer() {
  const [windowSize, setWindowSize] = useState(4096);
  const [numLayers, setNumLayers] = useState(32);

  const effectiveCtx = useMemo(() => Math.min(windowSize * numLayers, 131072), [windowSize, numLayers]);
  const memReduction = useMemo(() => {
    const fullCtx = 131072;
    return ((1 - windowSize / fullCtx) * 100).toFixed(0);
  }, [windowSize]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Effective Context Through Layers
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Even with a small window, stacking layers lets information propagate across the full sequence.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Window Size</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{windowSize.toLocaleString()}</span>
          </div>
          <input type="range" min={256} max={32768} step={256} value={windowSize}
            onChange={e => setWindowSize(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Layers</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{numLayers}</span>
          </div>
          <input type="range" min={1} max={128} step={1} value={numLayers}
            onChange={e => setNumLayers(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Layer propagation visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#7A8B7C', marginBottom: '0.75rem' }}>Information reach per layer</div>
        {[1, 2, 4, 8, Math.min(numLayers, 16), numLayers].filter((v, i, arr) => arr.indexOf(v) === i && v <= numLayers).slice(0, 5).map(layer => {
          const reach = Math.min(windowSize * layer, 131072);
          const pct = (reach / 131072) * 100;
          return (
            <div key={layer} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 80px', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#5A6B5C', textAlign: 'right' }}>Layer {layer}</span>
              <div style={{ height: '16px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#8BA888' : '#D4A843', borderRadius: '3px', transition: 'width 0.2s ease' }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#7A8B7C' }}>{reach >= 131072 ? '128K+' : `${(reach / 1000).toFixed(1)}K`}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Effective Context</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{effectiveCtx >= 131072 ? '128K+' : `${(effectiveCtx / 1000).toFixed(1)}K`}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Per-Layer Memory Saved</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#8BA888' }}>{memReduction}%</div>
        </div>
      </div>
    </div>
  );
}
