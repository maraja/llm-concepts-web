import { useState } from 'react';

const STEPS = [
  {
    title: '1. Input Embeddings',
    desc: 'Each token is represented as a vector (embedding). "The cat sat" becomes three vectors.',
    visual: [
      { label: 'The', values: [0.2, 0.8, 0.1], color: '#8BA888' },
      { label: 'cat', values: [0.9, 0.3, 0.7], color: '#D4A843' },
      { label: 'sat', values: [0.4, 0.6, 0.5], color: '#C76B4A' },
    ],
    highlight: 'input',
  },
  {
    title: '2. Create Q, K, V',
    desc: 'Each embedding is projected through three learned weight matrices to create Query, Key, and Value vectors.',
    visual: [
      { label: 'Q', values: [0.5, 0.3, 0.9], color: '#C76B4A' },
      { label: 'K', values: [0.7, 0.1, 0.4], color: '#D4A843' },
      { label: 'V', values: [0.2, 0.8, 0.6], color: '#8BA888' },
    ],
    highlight: 'qkv',
  },
  {
    title: '3. Compute Attention Scores',
    desc: 'Dot product of Query × Key^T gives raw attention scores. Higher scores = more relevant.',
    visual: [
      { label: 'The→The', values: [0.82], color: '#7A8B7C' },
      { label: 'The→cat', values: [2.41], color: '#C76B4A' },
      { label: 'The→sat', values: [1.05], color: '#D4A843' },
    ],
    highlight: 'scores',
  },
  {
    title: '4. Scale & Softmax',
    desc: 'Scores are divided by √dₖ to prevent vanishing gradients, then softmax converts to probabilities.',
    visual: [
      { label: 'The→The', values: [0.12], color: '#7A8B7C' },
      { label: 'The→cat', values: [0.65], color: '#C76B4A' },
      { label: 'The→sat', values: [0.23], color: '#D4A843' },
    ],
    highlight: 'softmax',
  },
  {
    title: '5. Weighted Sum of Values',
    desc: 'Attention probabilities weight the Value vectors. The output is a context-aware representation.',
    visual: [
      { label: 'Output', values: [0.48, 0.52, 0.63], color: '#3D5240' },
    ],
    highlight: 'output',
  },
];

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function SelfAttentionWalkthrough() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Self-Attention Step by Step
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Walk through how self-attention computes a context-aware representation for each token.
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem' }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: i <= step ? '#C76B4A' : '#E5DFD3',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          />
        ))}
      </div>

      {/* Current step content */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.05rem', fontWeight: 600, color: '#2C3E2D', margin: '0 0 0.4rem 0' }}>
          {current.title}
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#5A6B5C', lineHeight: 1.6, margin: 0 }}>
          {current.desc}
        </p>
      </div>

      {/* Visual */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
        {current.visual.map((row) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 600, color: row.color, width: '70px', textAlign: 'right' }}>
              {row.label}
            </span>
            <div style={{ display: 'flex', gap: '0.3rem', flex: 1 }}>
              {row.values.map((v, j) => (
                <div key={j} style={{
                  flex: 1,
                  height: '28px',
                  background: `${row.color}${Math.round(v * 80 + 20).toString(16).padStart(2, '0')}`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: v > 0.5 ? '#FDFBF7' : '#2C3E2D',
                  fontWeight: 500,
                }}>
                  {v.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            border: '1px solid #E5DFD3',
            background: step === 0 ? '#F5F0E8' : '#FDFBF7',
            color: step === 0 ? '#B0A898' : '#5A6B5C',
            fontSize: '0.8rem',
            cursor: step === 0 ? 'default' : 'pointer',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}
        >
          ← Previous
        </button>
        <span style={{ fontSize: '0.75rem', color: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace" }}>
          {step + 1} / {STEPS.length}
        </span>
        <button
          onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
          disabled={step === STEPS.length - 1}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            border: `1px solid ${step === STEPS.length - 1 ? '#E5DFD3' : '#C76B4A'}`,
            background: step === STEPS.length - 1 ? '#F5F0E8' : 'rgba(199, 107, 74, 0.08)',
            color: step === STEPS.length - 1 ? '#B0A898' : '#C76B4A',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: step === STEPS.length - 1 ? 'default' : 'pointer',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
