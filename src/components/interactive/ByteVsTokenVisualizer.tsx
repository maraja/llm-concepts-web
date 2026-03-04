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
    text: 'Hello world!',
    tokens: ['Hello', ' world', '!'],
    bytes: 'Hello world!'.split(''),
  },
  {
    text: 'café résumé',
    tokens: ['caf', 'é', ' r', 'és', 'um', 'é'],
    bytes: [...'café résumé'],
  },
  {
    text: '🤖💡🧠',
    tokens: ['🤖', '💡', '🧠'],
    bytes: ['🤖', '💡', '🧠'].flatMap(e => [`[${e}`, ':4B]']),
  },
  {
    text: 'print("你好")',
    tokens: ['print', '("', '你', '好', '")'],
    bytes: [...'print("你好")'],
  },
];

export default function ByteVsTokenVisualizer() {
  const [exampleIdx, setExampleIdx] = useState(1);
  const example = EXAMPLES[exampleIdx];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Bytes vs. Tokens
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare how tokenizers and byte-level models segment the same text. Notice how tokenization struggles with non-English and special characters.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => setExampleIdx(i)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${exampleIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: exampleIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: exampleIdx === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: exampleIdx === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {ex.text}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {/* Tokenizer view */}
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#C76B4A', marginBottom: '0.5rem' }}>
            BPE Tokens ({example.tokens.length})
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {example.tokens.map((tok, i) => (
              <span key={i} style={{
                padding: '0.25rem 0.4rem', borderRadius: '4px', background: '#C76B4A15',
                border: '1px solid #C76B4A25', fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.75rem', color: '#2C3E2D',
              }}>
                {tok === ' ' ? '⎵' : tok}
              </span>
            ))}
          </div>
        </div>

        {/* Byte view */}
        <div style={{ background: '#3D524008', borderRadius: '8px', padding: '0.75rem', border: '1px solid #8BA88820' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3D5240', marginBottom: '0.5rem' }}>
            Bytes ({example.bytes.length})
          </div>
          <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
            {example.bytes.map((b, i) => (
              <span key={i} style={{
                padding: '0.2rem 0.3rem', borderRadius: '3px', background: '#8BA88815',
                border: '1px solid #8BA88825', fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem', color: '#2C3E2D',
              }}>
                {b === ' ' ? '⎵' : b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Tokenizer</div>
          <div style={{ fontSize: '0.78rem', color: '#5A6B5C', marginTop: '0.2rem' }}>Fixed vocab (32K-100K), language-biased, no OOV handling</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#3D524008', borderRadius: '8px', border: '1px solid #8BA88815' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Byte-Level</div>
          <div style={{ fontSize: '0.78rem', color: '#5A6B5C', marginTop: '0.2rem' }}>256 byte vocab, universal, no tokenizer artifacts</div>
        </div>
      </div>
    </div>
  );
}
