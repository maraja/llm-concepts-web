import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const TOKENS = ['The', 'neural', 'network', 'learns', 'from', 'data'];
const EXPERTS = ['Math/Logic', 'Language', 'Code', 'Science', 'Reasoning', 'Memory', 'Syntax', 'World'];

// Simulated routing scores (each token → expert affinities)
const ROUTING: number[][] = [
  [0.05, 0.15, 0.02, 0.03, 0.08, 0.10, 0.52, 0.05],
  [0.08, 0.12, 0.05, 0.45, 0.10, 0.08, 0.07, 0.05],
  [0.10, 0.08, 0.15, 0.35, 0.12, 0.05, 0.10, 0.05],
  [0.12, 0.15, 0.08, 0.10, 0.35, 0.08, 0.07, 0.05],
  [0.05, 0.10, 0.02, 0.03, 0.08, 0.05, 0.62, 0.05],
  [0.05, 0.10, 0.08, 0.12, 0.10, 0.15, 0.05, 0.35],
];

export default function MoERoutingVisualizer() {
  const [topK, setTopK] = useState(2);
  const [selectedToken, setSelectedToken] = useState(1);

  const tokenRouting = ROUTING[selectedToken];
  const sorted = useMemo(() =>
    EXPERTS.map((name, i) => ({ name, score: tokenRouting[i], idx: i }))
      .sort((a, b) => b.score - a.score),
  [selectedToken]);

  const activeExperts = sorted.slice(0, topK);
  const totalActive = activeExperts.reduce((s, e) => s + e.score, 0);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          MoE Expert Routing
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how the router selects the top-K experts for each token. Different tokens activate different experts.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Top-K experts</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{topK}</span>
          </div>
          <input type="range" min={1} max={4} step={1} value={topK}
            onChange={e => setTopK(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Token selector */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {TOKENS.map((tok, i) => (
          <button key={i} onClick={() => setSelectedToken(i)} style={{
            padding: '0.35rem 0.6rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem',
            border: `1px solid ${selectedToken === i ? '#C76B4A' : '#E5DFD3'}`,
            background: selectedToken === i ? '#C76B4A10' : 'transparent',
            color: selectedToken === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: selectedToken === i ? 600 : 400,
            cursor: 'pointer',
          }}>
            {tok}
          </button>
        ))}
      </div>

      {/* Expert scores */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        {sorted.map((expert, rank) => {
          const isActive = rank < topK;
          return (
            <div key={expert.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 45px', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', opacity: isActive ? 1 : 0.35, transition: 'opacity 0.15s ease' }}>
              <span style={{ fontSize: '0.75rem', color: isActive ? '#2C3E2D' : '#7A8B7C', fontWeight: isActive ? 600 : 400 }}>
                {expert.name}
              </span>
              <div style={{ height: '18px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${expert.score * 100 / sorted[0].score}%`,
                  background: isActive ? (rank === 0 ? '#C76B4A' : '#D4A843') : '#B0A898',
                  borderRadius: '3px', transition: 'width 0.2s ease',
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#7A8B7C', textAlign: 'right' }}>
                {(expert.score * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Active</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>{topK} of {EXPERTS.length}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>FLOPs Used</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#3D5240' }}>{((topK / EXPERTS.length) * 100).toFixed(0)}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total Params</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>{EXPERTS.length}× FFN</div>
        </div>
      </div>
    </div>
  );
}
