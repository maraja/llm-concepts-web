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
    name: 'Character',
    tokenize: (text: string) => [...text],
    description: 'Each character is a token. Simple but very long sequences.',
  },
  {
    name: 'Whitespace',
    tokenize: (text: string) => text.split(/(\s+)/).filter(Boolean),
    description: 'Split on spaces. Simple but no subword sharing.',
  },
  {
    name: 'BPE-like',
    tokenize: (text: string) => {
      // Simulated BPE: common subwords get merged
      const merges = ['th', 'the', 'ing', 'tion', 'er', 'ed', 'an', 'is', 'al'];
      let tokens: string[] = [...text];
      for (const merge of merges) {
        const result: string[] = [];
        let i = 0;
        while (i < tokens.length) {
          const window = tokens.slice(i, i + merge.length).join('');
          if (window.toLowerCase() === merge && tokens.slice(i, i + merge.length).every(t => t.length === 1)) {
            result.push(tokens.slice(i, i + merge.length).join(''));
            i += merge.length;
          } else {
            result.push(tokens[i]);
            i++;
          }
        }
        tokens = result;
      }
      return tokens;
    },
    description: 'Iteratively merge frequent pairs. Balances vocab size and coverage.',
  },
];

export default function TokenizationPlayground() {
  const [text, setText] = useState('The tokenization process is interesting');
  const [methodIdx, setMethodIdx] = useState(2);
  const method = METHODS[methodIdx];
  const tokens = method.tokenize(text);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Tokenization Methods
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare how different tokenization strategies break the same text into tokens.
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          style={{
            width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px',
            border: '1px solid #E5DFD3', background: '#F0EBE1',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
            color: '#2C3E2D', outline: 'none',
          }}
          placeholder="Type text to tokenize..."
        />
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {METHODS.map((m, i) => (
          <button key={i} onClick={() => setMethodIdx(i)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${methodIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: methodIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: methodIdx === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: methodIdx === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer',
          }}>
            {m.name}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '0.82rem', color: '#5A6B5C', marginBottom: '1rem', fontStyle: 'italic' }}>
        {method.description}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          {tokens.length} tokens
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {tokens.map((tok, i) => (
            <span key={i} style={{
              padding: '0.25rem 0.4rem', borderRadius: '4px',
              background: tok.trim() === '' ? '#D4A84320' : '#C76B4A15',
              border: `1px solid ${tok.trim() === '' ? '#D4A84340' : '#C76B4A25'}`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem', color: '#2C3E2D',
            }}>
              {tok === ' ' ? '⎵' : tok.replace(/ /g, '⎵')}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Characters</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{text.length}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Tokens</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{tokens.length}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Compression</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{(text.length / Math.max(1, tokens.length)).toFixed(1)}×</div>
        </div>
      </div>
    </div>
  );
}
