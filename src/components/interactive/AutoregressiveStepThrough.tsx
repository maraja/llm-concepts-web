import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const GENERATION_STEPS = [
  { context: ['The'], choices: [{ tok: 'cat', p: 0.35 }, { tok: 'dog', p: 0.25 }, { tok: 'quick', p: 0.15 }], selected: 'cat' },
  { context: ['The', 'cat'], choices: [{ tok: 'sat', p: 0.40 }, { tok: 'jumped', p: 0.20 }, { tok: 'slept', p: 0.15 }], selected: 'sat' },
  { context: ['The', 'cat', 'sat'], choices: [{ tok: 'on', p: 0.55 }, { tok: 'down', p: 0.20 }, { tok: 'quietly', p: 0.10 }], selected: 'on' },
  { context: ['The', 'cat', 'sat', 'on'], choices: [{ tok: 'the', p: 0.60 }, { tok: 'a', p: 0.20 }, { tok: 'my', p: 0.10 }], selected: 'the' },
  { context: ['The', 'cat', 'sat', 'on', 'the'], choices: [{ tok: 'mat', p: 0.30 }, { tok: 'floor', p: 0.25 }, { tok: 'roof', p: 0.15 }], selected: 'mat' },
];

export default function AutoregressiveStepThrough() {
  const [step, setStep] = useState(0);
  const current = GENERATION_STEPS[step];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Autoregressive Generation Step by Step
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch how a language model generates text one token at a time, each conditioned on all previous tokens.
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem' }}>
        {GENERATION_STEPS.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: i <= step ? '#C76B4A' : '#E5DFD3',
            border: 'none', cursor: 'pointer',
          }} />
        ))}
      </div>

      {/* Current context */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Context fed into the model:</div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {current.context.map((tok, i) => (
            <span key={i} style={{
              padding: '0.35rem 0.55rem', borderRadius: '5px', background: '#8BA88815',
              border: '1px solid #8BA88830', fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem', color: '#2C3E2D', fontWeight: 500,
            }}>
              {tok}
            </span>
          ))}
          <span style={{ padding: '0.35rem 0.55rem', borderRadius: '5px', background: '#C76B4A15',
            border: '2px dashed #C76B4A40', fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>
            ?
          </span>
        </div>
      </div>

      {/* Candidate tokens */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Top predicted next tokens:</div>
        {current.choices.map((choice) => (
          <div key={choice.tok} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 50px', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0',
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', textAlign: 'right',
              color: choice.tok === current.selected ? '#C76B4A' : '#5A6B5C',
              fontWeight: choice.tok === current.selected ? 600 : 400,
            }}>
              {choice.tok}
            </span>
            <div style={{ height: '20px', background: '#F0EBE1', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${choice.p * 100}%`,
                background: choice.tok === current.selected ? 'linear-gradient(90deg, #C76B4A, #D4896D)' : '#8BA888',
                borderRadius: '4px', transition: 'width 0.2s ease',
              }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#7A8B7C', textAlign: 'right' }}>
              {(choice.p * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
          padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid #E5DFD3',
          background: step === 0 ? '#F5F0E8' : '#FDFBF7',
          color: step === 0 ? '#B0A898' : '#5A6B5C',
          fontSize: '0.8rem', cursor: step === 0 ? 'default' : 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>
          ← Back
        </button>
        <span style={{ fontSize: '0.72rem', color: '#7A8B7C' }}>
          Sampled: <strong style={{ color: '#C76B4A' }}>{current.selected}</strong> → step {step + 1}/{GENERATION_STEPS.length}
        </span>
        <button onClick={() => setStep(Math.min(GENERATION_STEPS.length - 1, step + 1))} disabled={step === GENERATION_STEPS.length - 1} style={{
          padding: '0.4rem 1rem', borderRadius: '6px',
          border: `1px solid ${step === GENERATION_STEPS.length - 1 ? '#E5DFD3' : '#C76B4A'}`,
          background: step === GENERATION_STEPS.length - 1 ? '#F5F0E8' : '#C76B4A10',
          color: step === GENERATION_STEPS.length - 1 ? '#B0A898' : '#C76B4A',
          fontSize: '0.8rem', fontWeight: 500, cursor: step === GENERATION_STEPS.length - 1 ? 'default' : 'pointer',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>
          Generate →
        </button>
      </div>
    </div>
  );
}
