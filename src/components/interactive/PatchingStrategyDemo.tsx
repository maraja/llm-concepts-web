import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const STRATEGIES = [
  {
    name: 'Fixed-size',
    description: 'Split bytes into equal-length patches regardless of content',
    patches: [
      { bytes: 'T h e ', label: 'Patch 1' },
      { bytes: 'c a t ', label: 'Patch 2' },
      { bytes: 's a t ', label: 'Patch 3' },
      { bytes: 'o n . ', label: 'Patch 4' },
    ],
    pros: 'Simple, predictable sequence length',
    cons: 'Splits words mid-boundary, wastes compute on spaces',
  },
  {
    name: 'Entropy-based',
    description: 'Place patch boundaries where byte entropy spikes (surprisal)',
    patches: [
      { bytes: 'The ', label: 'Low entropy' },
      { bytes: 'cat ', label: 'Low entropy' },
      { bytes: 'sat ', label: 'Low entropy' },
      { bytes: 'on', label: 'Low entropy' },
      { bytes: '.', label: 'High entropy' },
    ],
    pros: 'Aligns with semantic boundaries, efficient',
    cons: 'Requires entropy model, variable patch sizes',
  },
  {
    name: 'Strided',
    description: 'Overlapping patches with a stride smaller than patch size',
    patches: [
      { bytes: 'T h e c', label: 'Patch 1' },
      { bytes: 'e c a t', label: 'Patch 2 (overlap)' },
      { bytes: 'a t s a', label: 'Patch 3 (overlap)' },
      { bytes: 's a t o', label: 'Patch 4 (overlap)' },
      { bytes: 't o n .', label: 'Patch 5 (overlap)' },
    ],
    pros: 'No information lost at boundaries',
    cons: 'Higher compute cost due to redundancy',
  },
];

export default function PatchingStrategyDemo() {
  const [strategyIdx, setStrategyIdx] = useState(1);
  const strategy = STRATEGIES[strategyIdx];

  const inputText = 'The cat sat on.';
  const inputBytes = [...inputText];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Byte Patching Strategies
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          BLTs group raw bytes into patches before the transformer processes them. The patching strategy affects efficiency and quality.
        </p>
      </div>

      {/* Input bytes */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.4rem', fontWeight: 600 }}>Input bytes</div>
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
          {inputBytes.map((b, i) => (
            <span key={i} style={{
              padding: '0.25rem 0.35rem', borderRadius: '3px',
              background: '#8BA88815', border: '1px solid #8BA88825',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#2C3E2D',
            }}>
              {b === ' ' ? '⎵' : b}
            </span>
          ))}
        </div>
      </div>

      {/* Strategy selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STRATEGIES.map((s, i) => (
          <button key={i} onClick={() => setStrategyIdx(i)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${strategyIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: strategyIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: strategyIdx === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: strategyIdx === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer',
          }}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Strategy description */}
      <div style={{ fontSize: '0.82rem', color: '#5A6B5C', marginBottom: '1rem', fontStyle: 'italic' }}>
        {strategy.description}
      </div>

      {/* Patch visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.6rem', fontWeight: 600 }}>
          {strategy.patches.length} patches → transformer
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {strategy.patches.map((patch, i) => {
            const colors = ['#C76B4A', '#D4A843', '#8BA888', '#3D5240', '#7A5C3E'];
            const color = colors[i % colors.length];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  display: 'flex', gap: '2px',
                  padding: '0.3rem 0.5rem', borderRadius: '5px',
                  background: `${color}10`, border: `1px solid ${color}30`,
                  flex: 1,
                }}>
                  {patch.bytes.split('').map((b, j) => (
                    <span key={j} style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
                      color: '#2C3E2D', fontWeight: 500,
                    }}>
                      {b === ' ' ? '⎵' : b}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '0.62rem', color: '#7A8B7C', minWidth: '80px', textAlign: 'right' }}>
                  {patch.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pros / Cons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#8BA88810', borderRadius: '8px', border: '1px solid #8BA88820' }}>
          <div style={{ fontSize: '0.6rem', color: '#3D5240', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Advantage</div>
          <div style={{ fontSize: '0.75rem', color: '#5A6B5C' }}>{strategy.pros}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#C76B4A08', borderRadius: '8px', border: '1px solid #C76B4A15' }}>
          <div style={{ fontSize: '0.6rem', color: '#C76B4A', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Tradeoff</div>
          <div style={{ fontSize: '0.75rem', color: '#5A6B5C' }}>{strategy.cons}</div>
        </div>
      </div>
    </div>
  );
}
