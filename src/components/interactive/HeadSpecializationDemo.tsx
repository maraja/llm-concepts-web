import { useState } from 'react';

const SENTENCE = 'The quick brown fox jumps over the lazy dog';
const WORDS = SENTENCE.split(' ');

const HEAD_TYPES = [
  {
    name: 'Syntactic Head',
    desc: 'Tracks grammatical relationships (subject→verb, adjective→noun)',
    connections: [[0, 3], [1, 2], [2, 3], [4, 3], [5, 4], [6, 8], [7, 8]],
    color: '#C76B4A',
  },
  {
    name: 'Positional Head',
    desc: 'Attends to nearby tokens within a local window',
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]],
    color: '#D4A843',
  },
  {
    name: 'Rare Token Head',
    desc: 'Focuses on infrequent or semantically rich words',
    connections: [[0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 8], [7, 3], [8, 3]],
    color: '#8BA888',
  },
  {
    name: 'Previous Token Head',
    desc: 'Simple pattern: each token attends to the one before it',
    connections: [[1, 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6], [8, 7]],
    color: '#6E8B6B',
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

export default function HeadSpecializationDemo() {
  const [activeType, setActiveType] = useState(0);
  const head = HEAD_TYPES[activeType];

  const isConnected = (i: number) =>
    head.connections.some(([from, to]) => from === i || to === i);
  const isSource = (i: number) =>
    head.connections.some(([from]) => from === i);
  const isTarget = (i: number) =>
    head.connections.some(([, to]) => to === i);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Head Specialization Patterns
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Different heads in multi-head attention learn to focus on different linguistic features.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {HEAD_TYPES.map((h, i) => (
          <button key={h.name} onClick={() => setActiveType(i)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${activeType === i ? h.color : '#E5DFD3'}`,
            background: activeType === i ? h.color + '12' : 'transparent',
            color: activeType === i ? h.color : '#5A6B5C',
            fontWeight: activeType === i ? 600 : 400,
            fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {h.name}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: head.color, marginBottom: '0.25rem' }}>{head.name}</div>
        <div style={{ fontSize: '0.78rem', color: '#7A8B7C', marginBottom: '1rem' }}>{head.desc}</div>

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {WORDS.map((word, i) => (
            <span key={i} style={{
              padding: '0.3rem 0.5rem',
              borderRadius: '5px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.82rem',
              background: isTarget(i) ? head.color + '25' : isSource(i) ? head.color + '10' : 'transparent',
              color: isConnected(i) ? '#2C3E2D' : '#B0A898',
              fontWeight: isTarget(i) ? 600 : 400,
              border: `1px solid ${isTarget(i) ? head.color : 'transparent'}`,
              transition: 'all 0.2s ease',
            }}>
              {word}
            </span>
          ))}
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.7rem', color: '#7A8B7C' }}>
          <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: head.color + '25', border: `1px solid ${head.color}`, marginRight: '4px', verticalAlign: 'middle' }} />Target</span>
          <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: head.color + '10', marginRight: '4px', verticalAlign: 'middle' }} />Source</span>
          <span>{head.connections.length} connections</span>
        </div>
      </div>
    </div>
  );
}
