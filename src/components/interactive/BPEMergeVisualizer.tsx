import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const STEPS = [
  { tokens: ['l', 'o', 'w', '⎵', 'l', 'o', 'w', 'e', 'r', '⎵', 'n', 'e', 'w', 'e', 'r'], merge: null, description: 'Start: every character is its own token' },
  { tokens: ['lo', 'w', '⎵', 'lo', 'w', 'e', 'r', '⎵', 'n', 'e', 'w', 'e', 'r'], merge: ['l', 'o'], description: 'Merge "l" + "o" → "lo" (most frequent pair: 2 occurrences)' },
  { tokens: ['low', '⎵', 'low', 'e', 'r', '⎵', 'n', 'e', 'w', 'e', 'r'], merge: ['lo', 'w'], description: 'Merge "lo" + "w" → "low" (2 occurrences)' },
  { tokens: ['low', '⎵', 'low', 'er', '⎵', 'n', 'ew', 'er'], merge: ['e', 'r'], description: 'Merge "e" + "r" → "er" (2 occurrences)' },
  { tokens: ['low', '⎵', 'low', 'er', '⎵', 'new', 'er'], merge: ['n', 'ew'], description: 'Merge "n" + "ew" → "new" (1 occurrence)' },
  { tokens: ['low', '⎵', 'lower', '⎵', 'newer'], merge: ['low', 'er'], description: 'Merge "low" + "er" → "lower" / "new" + "er" → "newer"' },
];

export default function BPEMergeVisualizer() {
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
          BPE Merge Steps
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch BPE build a vocabulary by iteratively merging the most frequent character pairs.
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.3rem' }}>Training text</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#2C3E2D', padding: '0.5rem 0.75rem', background: '#F0EBE1', borderRadius: '6px' }}>
          "low lower newer"
        </div>
      </div>

      {/* Step controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
          padding: '0.3rem 0.6rem', borderRadius: '5px', border: '1px solid #E5DFD3',
          background: step === 0 ? '#F0EBE1' : '#FDFBF7', color: step === 0 ? '#B0A898' : '#C76B4A',
          fontSize: '0.75rem', cursor: step === 0 ? 'default' : 'pointer', fontWeight: 600,
        }}>← Prev</button>
        <div style={{ flex: 1, display: 'flex', gap: '3px' }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              flex: 1, height: '6px', borderRadius: '3px', cursor: 'pointer',
              background: i <= step ? '#C76B4A' : '#E5DFD3',
              transition: 'background 0.15s ease',
            }} />
          ))}
        </div>
        <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1} style={{
          padding: '0.3rem 0.6rem', borderRadius: '5px', border: '1px solid #E5DFD3',
          background: step === STEPS.length - 1 ? '#F0EBE1' : '#FDFBF7', color: step === STEPS.length - 1 ? '#B0A898' : '#C76B4A',
          fontSize: '0.75rem', cursor: step === STEPS.length - 1 ? 'default' : 'pointer', fontWeight: 600,
        }}>Next →</button>
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.3rem', fontWeight: 600 }}>
          Step {step} of {STEPS.length - 1}
          {current.merge && <span style={{ color: '#C76B4A' }}> — merge "{current.merge[0]}" + "{current.merge[1]}"</span>}
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {current.tokens.map((tok, i) => {
            const isNew = current.merge && tok === current.merge.join('');
            return (
              <span key={i} style={{
                padding: '0.3rem 0.45rem', borderRadius: '4px',
                background: isNew ? '#C76B4A20' : tok === '⎵' ? '#D4A84315' : '#8BA88815',
                border: `1px solid ${isNew ? '#C76B4A40' : tok === '⎵' ? '#D4A84330' : '#8BA88825'}`,
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem',
                color: '#2C3E2D', fontWeight: isNew ? 700 : 400,
                transition: 'all 0.15s ease',
              }}>
                {tok}
              </span>
            );
          })}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#5A6B5C' }}>{current.description}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Vocab Size</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{new Set(current.tokens).size}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Tokens</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{current.tokens.length}</div>
        </div>
      </div>
    </div>
  );
}
