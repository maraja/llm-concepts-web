import { useState } from 'react';

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function CausalVsBidirectional() {
  const [mode, setMode] = useState<'causal' | 'bidirectional'>('causal');
  const [queryPos, setQueryPos] = useState(3);

  const canAttend = (queryIdx: number, keyIdx: number) => {
    if (mode === 'bidirectional') return true;
    return keyIdx <= queryIdx;
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Causal vs. Bidirectional Attention
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Toggle between causal (GPT-style) and bidirectional (BERT-style) attention to see the difference.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {(['causal', 'bidirectional'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '0.4rem 1rem', borderRadius: '6px',
            border: `1px solid ${mode === m ? '#C76B4A' : '#E5DFD3'}`,
            background: mode === m ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: mode === m ? '#C76B4A' : '#5A6B5C',
            fontWeight: mode === m ? 600 : 400, fontSize: '0.82rem', cursor: 'pointer',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {m === 'causal' ? 'Causal (GPT)' : 'Bidirectional (BERT)'}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#7A8B7C', marginBottom: '0.75rem' }}>
          Click a token to set it as the query position:
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1rem', justifyContent: 'center' }}>
          {TOKENS.map((tok, i) => {
            const isQuery = i === queryPos;
            const visible = canAttend(queryPos, i);
            return (
              <button key={i} onClick={() => setQueryPos(i)} style={{
                padding: '0.5rem 0.7rem', borderRadius: '6px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
                border: isQuery ? '2px solid #C76B4A' : `1px solid ${visible ? '#8BA888' : '#E5DFD3'}`,
                background: isQuery ? 'rgba(199, 107, 74, 0.1)' : visible ? 'rgba(139, 168, 136, 0.1)' : '#F5F0E850',
                color: isQuery ? '#C76B4A' : visible ? '#2C3E2D' : '#B0A898',
                fontWeight: isQuery ? 700 : visible ? 500 : 400,
                cursor: 'pointer',
                opacity: visible || isQuery ? 1 : 0.4,
                transition: 'all 0.2s ease',
                textDecoration: !visible && !isQuery ? 'line-through' : 'none',
              }}>
                {tok}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '0.78rem' }}>
          <span style={{ color: '#7A8B7C' }}>Visible context:</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#2C3E2D' }}>
            {TOKENS.filter((_, i) => canAttend(queryPos, i)).length} of {TOKENS.length} tokens
          </span>
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        {mode === 'causal'
          ? <>Causal attention is used in <strong>autoregressive models</strong> (GPT, LLaMA) — each token can only see past tokens, enabling left-to-right generation.</>
          : <>Bidirectional attention is used in <strong>encoder models</strong> (BERT, RoBERTa) — each token sees the full context, ideal for understanding but not generation.</>
        }
      </div>
    </div>
  );
}
