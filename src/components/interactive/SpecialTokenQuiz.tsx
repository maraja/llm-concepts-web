import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const TOKENS = [
  { token: '<BOS>', purpose: 'Beginning of sequence', desc: 'Marks the start of input. Becomes an attention sink in many models.' },
  { token: '<EOS>', purpose: 'End of sequence', desc: 'Signals completion. Model stops generating when this is produced.' },
  { token: '<PAD>', purpose: 'Padding', desc: 'Fills shorter sequences in a batch to match the longest. Masked during attention.' },
  { token: '<SEP>', purpose: 'Segment separator', desc: 'Separates two text segments (e.g., question and passage in BERT).' },
  { token: '<MASK>', purpose: 'Masked token', desc: 'Placeholder for masked language modeling. Model predicts the original token.' },
  { token: '<UNK>', purpose: 'Unknown token', desc: 'Fallback for out-of-vocabulary inputs. Rare with BPE tokenizers.' },
];

export default function SpecialTokenQuiz() {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Special Token Reference
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Click each token to reveal its purpose and how it's used during training and inference.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {TOKENS.map((tok, i) => {
          const isRevealed = revealed.has(i);
          return (
            <div key={i} onClick={() => toggle(i)} style={{
              padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
              background: isRevealed ? '#F0EBE1' : '#FDFBF7',
              border: `1px solid ${isRevealed ? '#C76B4A30' : '#E5DFD3'}`,
              transition: 'all 0.15s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isRevealed ? '0.5rem' : 0 }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
                  fontWeight: 700, color: '#C76B4A',
                }}>
                  {tok.token}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#7A8B7C' }}>
                  {isRevealed ? '▼' : '▶'}
                </span>
              </div>
              {isRevealed && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D', marginBottom: '0.2rem' }}>
                    {tok.purpose}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#5A6B5C', lineHeight: 1.5 }}>
                    {tok.desc}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.68rem', color: '#7A8B7C', textAlign: 'center' }}>
        {revealed.size} of {TOKENS.length} revealed — click to expand
      </div>
    </div>
  );
}
