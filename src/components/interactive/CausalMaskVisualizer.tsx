import { useState } from 'react';

const TOKENS = ['I', 'love', 'large', 'language', 'models'];

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function CausalMaskVisualizer() {
  const [selectedToken, setSelectedToken] = useState(3);
  const n = TOKENS.length;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Causal Mask Explorer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Click a token to see which positions it can attend to. The causal mask prevents looking at future tokens.
        </p>
      </div>

      {/* Token selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
        {TOKENS.map((tok, i) => (
          <button key={i} onClick={() => setSelectedToken(i)} style={{
            padding: '0.4rem 0.8rem', borderRadius: '6px',
            border: `1px solid ${selectedToken === i ? '#C76B4A' : '#E5DFD3'}`,
            background: selectedToken === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: selectedToken === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: selectedToken === i ? 600 : 400,
            fontSize: '0.85rem', cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {tok}
          </button>
        ))}
      </div>

      {/* Mask matrix */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#7A8B7C', marginBottom: '0.75rem', textAlign: 'center' }}>
          Causal Attention Mask (1 = can attend, 0 = masked)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `50px repeat(${n}, 1fr)`, gap: '3px', maxWidth: '400px', margin: '0 auto' }}>
          <div />
          {TOKENS.map((t, j) => (
            <div key={j} style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', color: '#7A8B7C', paddingBottom: '0.25rem' }}>{t}</div>
          ))}
          {TOKENS.map((tok, i) => (
            <>
              <div key={`label-${i}`} style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', color: i === selectedToken ? '#C76B4A' : '#7A8B7C', fontWeight: i === selectedToken ? 600 : 400 }}>
                {tok}
              </div>
              {TOKENS.map((_, j) => {
                const canAttend = j <= i;
                const isSelectedRow = i === selectedToken;
                const isHighlighted = isSelectedRow && canAttend;
                const isMaskedHighlight = isSelectedRow && !canAttend;
                return (
                  <div key={`${i}-${j}`} style={{
                    aspectRatio: '1',
                    borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                    background: isHighlighted ? '#8BA888' : isMaskedHighlight ? '#C76B4A20' : canAttend ? '#8BA88830' : '#E5DFD3',
                    color: isHighlighted ? '#FDFBF7' : isMaskedHighlight ? '#C76B4A' : canAttend ? '#5A6B5C' : '#B0A898',
                    transition: 'all 0.15s ease',
                    minHeight: '32px',
                  }}>
                    {canAttend ? '1' : '0'}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.8rem', color: '#5A6B5C', textAlign: 'center' }}>
        "<strong style={{ color: '#C76B4A' }}>{TOKENS[selectedToken]}</strong>" (position {selectedToken}) can attend to{' '}
        <strong>{selectedToken + 1}</strong> tokens: {TOKENS.slice(0, selectedToken + 1).map((t, i) => (
          <span key={i}><span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#3D5240' }}>{t}</span>{i < selectedToken ? ', ' : ''}</span>
        ))}
      </div>
    </div>
  );
}
