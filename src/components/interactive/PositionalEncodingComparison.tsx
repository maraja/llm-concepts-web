import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const METHODS = [
  {
    name: 'Sinusoidal',
    type: 'Absolute',
    learned: false,
    extrapolation: 'Poor',
    models: 'Original Transformer',
    color: '#8BA888',
    description: 'Fixed sine/cosine patterns. Added to embeddings. Cannot generalize beyond training length.',
  },
  {
    name: 'Learned',
    type: 'Absolute',
    learned: true,
    extrapolation: 'Poor',
    models: 'GPT-2, BERT',
    color: '#D4A843',
    description: 'Position embeddings trained from scratch. More flexible but still absolute positions.',
  },
  {
    name: 'RoPE',
    type: 'Relative',
    learned: false,
    extrapolation: 'Moderate',
    models: 'LLaMA, Mistral, Qwen',
    color: '#C76B4A',
    description: 'Rotates Q/K vectors by position angle. Dot product naturally captures relative distance.',
  },
  {
    name: 'ALiBi',
    type: 'Relative',
    learned: false,
    extrapolation: 'Excellent',
    models: 'BLOOM, MPT',
    color: '#3D5240',
    description: 'Linear bias subtracted from attention scores. Zero extra parameters. Best extrapolation.',
  },
];

export default function PositionalEncodingComparison() {
  const [selected, setSelected] = useState(2);
  const method = METHODS[selected];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Positional Encoding Methods
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare the four main approaches to injecting position information into transformers.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {METHODS.map((m, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${selected === i ? m.color : '#E5DFD3'}`,
            background: selected === i ? `${m.color}10` : 'transparent',
            color: selected === i ? m.color : '#5A6B5C',
            fontWeight: selected === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer',
          }}>
            {m.name}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.82rem', color: '#5A6B5C', marginBottom: '1rem', lineHeight: 1.6 }}>
          {method.description}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
          {[
            { label: 'Type', value: method.type },
            { label: 'Learned', value: method.learned ? 'Yes' : 'No' },
            { label: 'Extrapolation', value: method.extrapolation },
            { label: 'Used by', value: method.models },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: '#2C3E2D', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Extrapolation comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.3rem' }}>
        {METHODS.map((m, i) => {
          const level = m.extrapolation === 'Excellent' ? 1 : m.extrapolation === 'Moderate' ? 0.6 : 0.25;
          return (
            <div key={i} style={{ padding: '0.5rem', background: selected === i ? `${m.color}10` : '#F0EBE1', borderRadius: '6px', textAlign: 'center', border: selected === i ? `1px solid ${m.color}30` : '1px solid transparent' }}>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C', fontWeight: 600 }}>{m.name}</div>
              <div style={{ height: '4px', background: '#E5DFD3', borderRadius: '2px', marginTop: '0.3rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${level * 100}%`, background: m.color, borderRadius: '2px' }} />
              </div>
              <div style={{ fontSize: '0.55rem', color: '#7A8B7C', marginTop: '0.2rem' }}>{m.extrapolation}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
