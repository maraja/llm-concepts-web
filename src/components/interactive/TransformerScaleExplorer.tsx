import { useState, useMemo } from 'react';

const MODELS = [
  { name: 'GPT-2', params: 0.117, layers: 12, dModel: 768, heads: 12, year: 2019 },
  { name: 'GPT-3', params: 175, layers: 96, dModel: 12288, heads: 96, year: 2020 },
  { name: 'LLaMA-7B', params: 7, layers: 32, dModel: 4096, heads: 32, year: 2023 },
  { name: 'LLaMA-70B', params: 70, layers: 80, dModel: 8192, heads: 64, year: 2023 },
  { name: 'GPT-4 (est.)', params: 1760, layers: 120, dModel: 16384, heads: 128, year: 2023 },
];

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function TransformerScaleExplorer() {
  const [selected, setSelected] = useState(2);
  const model = MODELS[selected];
  const maxParams = Math.max(...MODELS.map(m => m.params));

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Transformer Scale Comparison
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare how the same architecture scales across different model sizes.
        </p>
      </div>

      {/* Model selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {MODELS.map((m, i) => (
          <button
            key={m.name}
            onClick={() => setSelected(i)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: `1px solid ${selected === i ? '#C76B4A' : '#E5DFD3'}`,
              background: selected === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
              color: selected === i ? '#C76B4A' : '#5A6B5C',
              fontWeight: selected === i ? 600 : 400,
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontFamily: "'Source Sans 3', system-ui, sans-serif",
            }}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Parameters', value: model.params >= 1 ? `${model.params}B` : `${(model.params * 1000).toFixed(0)}M`, sub: `${(model.params * 1e9 / 1e6).toFixed(0)}M params` },
          { label: 'Layers', value: String(model.layers), sub: `${model.layers} transformer blocks stacked` },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{stat.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', marginTop: '0.2rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginTop: '0.15rem' }}>{stat.sub}</div>
          </div>
        ))}
        {/* Math-notation stats rendered separately */}
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}><i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif", textTransform: 'none' as const }}>d</i><sub style={{ fontSize: '0.75em', textTransform: 'none' as const }}>model</sub></div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', marginTop: '0.2rem' }}>{model.dModel.toLocaleString()}</div>
          <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginTop: '0.15rem' }}>Hidden dimension width</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Attention Heads</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', marginTop: '0.2rem' }}>{model.heads}</div>
          <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginTop: '0.15rem' }}><i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub style={{ fontSize: '0.75em' }}>head</sub> = {model.dModel / model.heads}</div>
        </div>
      </div>

      {/* Scale bar */}
      <div style={{ padding: '0.75rem 1rem', background: '#F0EBE1', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.75rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Relative parameter count</div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'end', height: '50px' }}>
          {MODELS.map((m, i) => {
            const height = Math.max((m.params / maxParams) * 100, 3);
            return (
              <div key={m.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{
                  width: '100%',
                  height: `${height}%`,
                  minHeight: '3px',
                  background: i === selected ? '#C76B4A' : '#8BA888',
                  borderRadius: '3px 3px 0 0',
                  transition: 'all 0.2s ease',
                  opacity: i === selected ? 1 : 0.5,
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
          {MODELS.map((m, i) => (
            <div key={m.name} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', color: i === selected ? '#C76B4A' : '#7A8B7C', fontWeight: i === selected ? 600 : 400 }}>
              {m.name.replace(' (est.)', '')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
