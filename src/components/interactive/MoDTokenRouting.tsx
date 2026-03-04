import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const TOKENS = [
  { text: 'The', importance: 0.2, type: 'function' },
  { text: 'complex', importance: 0.85, type: 'content' },
  { text: 'mathematical', importance: 0.95, type: 'content' },
  { text: 'proof', importance: 0.9, type: 'content' },
  { text: 'was', importance: 0.15, type: 'function' },
  { text: 'published', importance: 0.7, type: 'content' },
  { text: 'in', importance: 0.1, type: 'function' },
  { text: 'the', importance: 0.1, type: 'function' },
  { text: 'journal', importance: 0.6, type: 'content' },
  { text: '.', importance: 0.05, type: 'punctuation' },
];

export default function MoDTokenRouting() {
  const [capacityRatio, setCapacityRatio] = useState(0.5);

  const budget = Math.max(1, Math.round(TOKENS.length * capacityRatio));
  const sorted = [...TOKENS].map((t, i) => ({ ...t, idx: i })).sort((a, b) => b.importance - a.importance);
  const processedIndices = new Set(sorted.slice(0, budget).map(t => t.idx));

  const computeSaved = ((1 - capacityRatio) * 100).toFixed(0);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Mixture of Depths: Token Routing
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Not all tokens need equal compute. MoD routes important tokens through the full layer while simple tokens skip it.
        </p>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>Capacity Ratio</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>{(capacityRatio * 100).toFixed(0)}%</span>
        </div>
        <input type="range" min={0.1} max={1.0} step={0.1} value={capacityRatio}
          onChange={e => setCapacityRatio(parseFloat(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
          <span>More efficient</span>
          <span>Full compute</span>
        </div>
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem' }}>
          {budget} of {TOKENS.length} tokens processed by this layer:
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {TOKENS.map((tok, i) => {
            const processed = processedIndices.has(i);
            return (
              <span key={i} style={{
                padding: '0.35rem 0.5rem', borderRadius: '5px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem',
                background: processed ? '#C76B4A15' : '#E5DFD340',
                border: `1px solid ${processed ? '#C76B4A40' : '#E5DFD3'}`,
                color: processed ? '#2C3E2D' : '#B0A898',
                fontWeight: processed ? 600 : 400,
                opacity: processed ? 1 : 0.5,
                transition: 'all 0.15s ease',
              }}>
                {tok.text}
                <span style={{ fontSize: '0.55rem', marginLeft: '2px', color: processed ? '#C76B4A' : '#B0A898' }}>
                  {processed ? '✓' : '→'}
                </span>
              </span>
            );
          })}
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#7A8B7C' }}>
          <span style={{ marginRight: '1rem' }}><span style={{ color: '#C76B4A' }}>✓</span> Full processing</span>
          <span><span style={{ color: '#B0A898' }}>→</span> Skip (residual only)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Compute Saved</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#3D5240' }}>{computeSaved}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Tokens Processed</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>{budget}/{TOKENS.length}</div>
        </div>
      </div>
    </div>
  );
}
