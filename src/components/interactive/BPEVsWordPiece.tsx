import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const ALGORITHMS = [
  {
    name: 'BPE',
    fullName: 'Byte-Pair Encoding',
    approach: 'Bottom-up: merge most frequent pairs',
    tokens: ['un', 'break', 'able'],
    models: 'GPT-2, GPT-3, GPT-4, LLaMA',
    vocabRange: '32K – 100K',
    color: '#C76B4A',
  },
  {
    name: 'WordPiece',
    fullName: 'WordPiece',
    approach: 'Bottom-up: merge pairs maximizing likelihood',
    tokens: ['un', '##break', '##able'],
    models: 'BERT, DistilBERT',
    vocabRange: '30K – 50K',
    color: '#8BA888',
  },
  {
    name: 'Unigram',
    fullName: 'Unigram LM',
    approach: 'Top-down: start large, prune least useful',
    tokens: ['▁un', 'break', 'able'],
    models: 'T5, mBART, XLNet',
    vocabRange: '32K – 64K',
    color: '#D4A843',
  },
];

const WORD = 'unbreakable';

export default function BPEVsWordPiece() {
  const [algoIdx, setAlgoIdx] = useState(0);
  const algo = ALGORITHMS[algoIdx];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Subword Algorithm Comparison
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          BPE, WordPiece, and Unigram all produce subword tokens — but with different strategies and notation.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {ALGORITHMS.map((a, i) => (
          <button key={i} onClick={() => setAlgoIdx(i)} style={{
            padding: '0.4rem 0.8rem', borderRadius: '6px',
            border: `1px solid ${algoIdx === i ? a.color : '#E5DFD3'}`,
            background: algoIdx === i ? `${a.color}10` : 'transparent',
            color: algoIdx === i ? a.color : '#5A6B5C',
            fontWeight: algoIdx === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer',
          }}>
            {a.name}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.3rem' }}>Input word</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', color: '#2C3E2D', marginBottom: '1rem', fontWeight: 600 }}>
          "{WORD}"
        </div>

        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          {algo.fullName} tokenization
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
          {algo.tokens.map((tok, i) => (
            <span key={i} style={{
              padding: '0.35rem 0.5rem', borderRadius: '5px',
              background: `${algo.color}15`, border: `1px solid ${algo.color}30`,
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
              color: '#2C3E2D', fontWeight: 600,
            }}>
              {tok}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>Approach</div>
            <div style={{ color: '#5A6B5C' }}>{algo.approach}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>Used by</div>
            <div style={{ color: '#5A6B5C' }}>{algo.models}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        Key difference: WordPiece uses <strong>##</strong> prefix for continuation, Unigram uses <strong>▁</strong> for word start, BPE uses spaces implicitly.
      </div>
    </div>
  );
}
