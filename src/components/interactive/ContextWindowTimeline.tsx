import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const MODELS = [
  { name: 'GPT-2', year: 2019, context: 1024, color: '#8BA888' },
  { name: 'GPT-3', year: 2020, context: 2048, color: '#8BA888' },
  { name: 'GPT-3.5', year: 2022, context: 4096, color: '#D4A843' },
  { name: 'Claude 2', year: 2023, context: 100000, color: '#D4A843' },
  { name: 'GPT-4 Turbo', year: 2023, context: 128000, color: '#C76B4A' },
  { name: 'Gemini 1.5', year: 2024, context: 1000000, color: '#C76B4A' },
  { name: 'Claude 3.5', year: 2024, context: 200000, color: '#C76B4A' },
  { name: 'Gemini 2.0', year: 2025, context: 2000000, color: '#3D5240' },
];

export default function ContextWindowTimeline() {
  const [selected, setSelected] = useState<number | null>(null);
  const [scale, setScale] = useState<'linear' | 'log'>('log');

  const maxCtx = Math.max(...MODELS.map(m => m.context));

  const getBarWidth = (ctx: number) => {
    if (scale === 'log') {
      const logMax = Math.log10(maxCtx);
      const logMin = Math.log10(1024);
      return ((Math.log10(ctx) - logMin) / (logMax - logMin)) * 100;
    }
    return (ctx / maxCtx) * 100;
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Context Window Evolution
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Context windows have grown 2000× in 6 years. Toggle between linear and log scale to appreciate the exponential growth.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {(['log', 'linear'] as const).map(s => (
          <button key={s} onClick={() => setScale(s)} style={{
            padding: '0.3rem 0.6rem', borderRadius: '6px',
            border: `1px solid ${scale === s ? '#C76B4A' : '#E5DFD3'}`,
            background: scale === s ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: scale === s ? '#C76B4A' : '#5A6B5C',
            fontWeight: scale === s ? 600 : 400,
            fontSize: '0.72rem', cursor: 'pointer',
          }}>
            {s === 'log' ? 'Log scale' : 'Linear scale'}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        {MODELS.map((model, i) => (
          <div key={i}
            onMouseEnter={() => setSelected(i)}
            onMouseLeave={() => setSelected(null)}
            style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 60px',
              alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0',
              opacity: selected !== null && selected !== i ? 0.4 : 1,
              transition: 'opacity 0.1s ease', cursor: 'pointer',
            }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>
              {model.name}
              <span style={{ fontSize: '0.55rem', color: '#7A8B7C', marginLeft: '4px' }}>{model.year}</span>
            </span>
            <div style={{ height: '18px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${Math.max(2, getBarWidth(model.context))}%`,
                background: model.color, borderRadius: '3px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#7A8B7C', textAlign: 'right' }}>
              {model.context >= 1000000 ? `${(model.context / 1000000).toFixed(0)}M` : model.context >= 1000 ? `${(model.context / 1000).toFixed(0)}K` : model.context}
            </span>
          </div>
        ))}
      </div>

      {selected !== null && (
        <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
          <strong>{MODELS[selected].name}</strong> ({MODELS[selected].year}): {MODELS[selected].context.toLocaleString()} tokens ≈ {Math.round(MODELS[selected].context * 0.75).toLocaleString()} words ≈ {Math.round(MODELS[selected].context * 0.75 / 250)} pages
        </div>
      )}
    </div>
  );
}
