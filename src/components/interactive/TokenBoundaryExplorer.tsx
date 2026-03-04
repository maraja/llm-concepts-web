import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const EXAMPLES = [
  {
    label: 'English',
    text: 'The cat sat on the mat.',
    tokens: ['The', ' cat', ' sat', ' on', ' the', ' mat', '.'],
    note: 'Common words get single tokens. Efficient encoding.',
  },
  {
    label: 'Code',
    text: 'def calculate_sum(numbers):',
    tokens: ['def', ' calculate', '_sum', '(', 'numbers', '):'],
    note: 'Underscores and parens are separate. Variable names may split.',
  },
  {
    label: 'Multilingual',
    text: 'Hello 你好 مرحبا',
    tokens: ['Hello', ' ', '你', '好', ' ', 'مر', 'حب', 'ا'],
    note: 'Non-Latin scripts need more tokens per word — tokenization bias.',
  },
  {
    label: 'Numbers',
    text: '3.14159265358979',
    tokens: ['3', '.', '14', '15', '92', '65', '35', '89', '79'],
    note: 'Digits are often split into 1-2 digit chunks. Math is hard for LLMs!',
  },
];

export default function TokenBoundaryExplorer() {
  const [exIdx, setExIdx] = useState(0);
  const example = EXAMPLES[exIdx];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Token Boundary Explorer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how token boundaries change across different text types. Tokenization biases affect everything downstream.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => setExIdx(i)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${exIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: exIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: exIdx === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: exIdx === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer',
          }}>
            {ex.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.3rem' }}>Original text</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.88rem', color: '#2C3E2D', marginBottom: '1rem' }}>
          {example.text}
        </div>

        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Tokens ({example.tokens.length})
        </div>
        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {example.tokens.map((tok, i) => {
            const colors = ['#C76B4A', '#8BA888', '#D4A843', '#3D5240', '#7A5C3E', '#6E8B6B', '#B85C3A', '#A89868', '#5A8B5A'];
            const color = colors[i % colors.length];
            return (
              <span key={i} style={{
                padding: '0.3rem 0.45rem', borderRadius: '4px',
                background: `${color}15`, border: `1px solid ${color}30`,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem', color: '#2C3E2D',
              }}>
                {tok === ' ' ? '⎵' : tok.replace(/^ /, '⎵')}
              </span>
            );
          })}
        </div>

        <div style={{ fontSize: '0.75rem', color: '#5A6B5C', fontStyle: 'italic', padding: '0.5rem 0.75rem', background: '#FDFBF7', borderRadius: '6px', border: '1px solid #E5DFD3' }}>
          {example.note}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Chars / Token</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{(example.text.length / example.tokens.length).toFixed(1)}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Token Count</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{example.tokens.length}</div>
        </div>
      </div>
    </div>
  );
}
