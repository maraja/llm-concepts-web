import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function FFNBottleneckExplorer() {
  const [dModel, setDModel] = useState(4096);
  const [multiplier, setMultiplier] = useState(4);

  const dFF = dModel * multiplier;
  const params = useMemo(() => 2 * dModel * dFF, [dModel, dFF]);
  const paramsStr = params >= 1e9 ? `${(params / 1e9).toFixed(2)}B` : params >= 1e6 ? `${(params / 1e6).toFixed(1)}M` : `${(params / 1e3).toFixed(0)}K`;

  const barMax = 16384 * 4;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          FFN Expand-Contract Bottleneck
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          The FFN expands to a higher dimension (<i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub>ff</sub>), applies non-linearity, then contracts back. Adjust the expansion ratio.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}><i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub style={{ fontSize: '0.75em' }}>model</sub></span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{dModel.toLocaleString()}</span>
          </div>
          <input type="range" min={256} max={16384} step={256} value={dModel}
            onChange={e => setDModel(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Expansion (×)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{multiplier}×</span>
          </div>
          <input type="range" min={1} max={8} step={0.5} value={multiplier}
            onChange={e => setMultiplier(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Visual bottleneck */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: `${Math.max((dModel / barMax) * 200, 20)}px`, height: '50px', background: '#8BA888', borderRadius: '4px', margin: '0 auto', transition: 'width 0.2s ease' }} />
            <div style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#5A6B5C', marginTop: '0.3rem' }}><i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub style={{ fontSize: '0.75em' }}>model</sub><br />{dModel.toLocaleString()}</div>
          </div>
          <span style={{ fontSize: '1.2rem', color: '#D4A843' }}>→</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: `${Math.max((dFF / barMax) * 200, 20)}px`, height: '50px', background: '#C76B4A', borderRadius: '4px', margin: '0 auto', transition: 'width 0.2s ease' }} />
            <div style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#5A6B5C', marginTop: '0.3rem' }}><i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub style={{ fontSize: '0.75em' }}>ff</sub><br />{dFF.toLocaleString()}</div>
          </div>
          <span style={{ fontSize: '1.2rem', color: '#D4A843' }}>→</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: `${Math.max((dModel / barMax) * 200, 20)}px`, height: '50px', background: '#8BA888', borderRadius: '4px', margin: '0 auto', transition: 'width 0.2s ease' }} />
            <div style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#5A6B5C', marginTop: '0.3rem' }}><i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub style={{ fontSize: '0.75em' }}>model</sub><br />{dModel.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>FFN Parameters</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#2C3E2D' }}>{paramsStr}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>% of Layer Params</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>~67%</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>FFN dominates parameter count</div>
        </div>
      </div>
    </div>
  );
}
