import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const CONFIGS = [
  { name: 'Multi-Head (MHA)', numQ: 8, numKV: 8, desc: 'Every query head has its own KV head — maximum expressiveness, highest memory' },
  { name: 'Grouped-Query (GQA)', numQ: 8, numKV: 2, desc: '4 query heads share 1 KV head — good quality/efficiency tradeoff' },
  { name: 'Multi-Query (MQA)', numQ: 8, numKV: 1, desc: 'All query heads share 1 KV pair — fastest inference, some quality loss' },
];

export default function GQAGroupingVisualizer() {
  const [configIdx, setConfigIdx] = useState(1);
  const config = CONFIGS[configIdx];
  const ratio = config.numQ / config.numKV;

  const groups: number[][] = [];
  for (let g = 0; g < config.numKV; g++) {
    const group: number[] = [];
    for (let q = g * ratio; q < (g + 1) * ratio && q < config.numQ; q++) {
      group.push(q);
    }
    groups.push(group);
  }

  const kvCacheReduction = ((1 - config.numKV / config.numQ) * 100).toFixed(0);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          GQA Grouping Visualizer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how query heads are grouped to share key-value heads, reducing KV cache memory.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {CONFIGS.map((c, i) => (
          <button key={c.name} onClick={() => setConfigIdx(i)} style={{
            padding: '0.35rem 0.75rem', borderRadius: '6px',
            border: `1px solid ${configIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: configIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: configIdx === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: configIdx === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {c.name}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.78rem', color: '#7A8B7C', marginBottom: '1rem' }}>
          {config.numQ} Query heads → {config.numKV} KV head{config.numKV > 1 ? 's' : ''} ({ratio}:1 ratio)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {groups.map((group, gIdx) => {
            const colors = ['#C76B4A', '#D4A843', '#8BA888', '#6E8B6B', '#7A8B7C', '#5A6B5C', '#3D5240', '#B8926A'];
            const kvColor = colors[gIdx % colors.length];
            return (
              <div key={gIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: `1px dashed ${kvColor}40`, background: `${kvColor}06` }}>
                <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
                  {group.map(qIdx => (
                    <div key={qIdx} style={{
                      padding: '0.3rem 0.5rem', borderRadius: '4px',
                      background: '#C76B4A15', border: '1px solid #C76B4A30',
                      fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: '#C76B4A',
                    }}>
                      Q{qIdx}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#7A8B7C' }}>→</span>
                <div style={{
                  padding: '0.3rem 0.6rem', borderRadius: '4px',
                  background: `${kvColor}20`, border: `1px solid ${kvColor}40`,
                  fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace",
                  color: kvColor, fontWeight: 600,
                }}>
                  KV{gIdx}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>KV Cache Savings</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 600, color: Number(kvCacheReduction) > 0 ? '#3D5240' : '#7A8B7C', marginTop: '0.2rem' }}>
            {kvCacheReduction}%
          </div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>KV Heads</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', marginTop: '0.2rem' }}>
            {config.numKV} of {config.numQ}
          </div>
        </div>
      </div>
    </div>
  );
}
