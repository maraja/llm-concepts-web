import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const ACTIVATIONS = [
  { name: 'ReLU', year: 2010, models: 'Early transformers', deadNeurons: 'High', smooth: 'No', compute: '1×', perf: 85 },
  { name: 'GELU', year: 2016, models: 'GPT-2, BERT, GPT-3', deadNeurons: 'None', smooth: 'Yes', compute: '3×', perf: 97 },
  { name: 'SiLU/Swish', year: 2017, models: 'LLaMA, PaLM', deadNeurons: 'None', smooth: 'Yes', compute: '2×', perf: 96 },
  { name: 'SwiGLU', year: 2020, models: 'LLaMA-2, Mistral, Gemma', deadNeurons: 'None', smooth: 'Yes', compute: '4×', perf: 100 },
];

export default function ActivationComparison() {
  const [selected, setSelected] = useState(3);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Activation Function Comparison
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare properties across activation functions used in modern transformers.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {ACTIVATIONS.map((a, i) => (
          <button key={a.name} onClick={() => setSelected(i)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${selected === i ? '#C76B4A' : '#E5DFD3'}`,
            background: selected === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: selected === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: selected === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {a.name}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Introduced', value: String(ACTIVATIONS[selected].year) },
            { label: 'Used in', value: ACTIVATIONS[selected].models },
            { label: 'Dead Neurons', value: ACTIVATIONS[selected].deadNeurons },
            { label: 'Smooth', value: ACTIVATIONS[selected].smooth },
            { label: 'Compute Cost', value: ACTIVATIONS[selected].compute },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '0.85rem', color: '#2C3E2D', fontWeight: 500 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: '#F0EBE1', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.75rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Relative performance (benchmarks)</div>
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'end', height: '40px' }}>
          {ACTIVATIONS.map((a, i) => (
            <div key={a.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '100%', height: `${a.perf * 0.4}px`,
                background: i === selected ? '#C76B4A' : '#8BA888',
                borderRadius: '3px 3px 0 0',
                opacity: i === selected ? 1 : 0.4,
                transition: 'all 0.2s ease',
              }} />
              <span style={{ fontSize: '0.58rem', color: i === selected ? '#C76B4A' : '#7A8B7C', marginTop: '0.2rem', fontWeight: i === selected ? 600 : 400 }}>
                {a.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
