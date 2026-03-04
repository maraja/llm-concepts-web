import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const MODELS = [
  { name: 'GPT-2', vocab: 50257, embDim: 768, lang: 'English-heavy' },
  { name: 'LLaMA', vocab: 32000, embDim: 4096, lang: 'English-focused' },
  { name: 'LLaMA 3', vocab: 128000, embDim: 4096, lang: 'Multilingual' },
  { name: 'Gemma', vocab: 256000, embDim: 3072, lang: 'Highly multilingual' },
];

export default function VocabSizeTradeoff() {
  const [vocabSize, setVocabSize] = useState(50000);
  const [embDim, setEmbDim] = useState(4096);

  const embParams = useMemo(() => (vocabSize * embDim) / 1e6, [vocabSize, embDim]);
  const maxVocab = 256000;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Vocabulary Size Tradeoffs
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Larger vocabularies compress text better but cost more embedding parameters. Find the sweet spot.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Vocab Size', value: vocabSize, set: setVocabSize, min: 1000, max: maxVocab, step: 1000, fmt: (v: number) => `${(v / 1000).toFixed(0)}K` },
          { label: 'Embed Dim', value: embDim, set: setEmbDim, min: 256, max: 8192, step: 256, fmt: (v: number) => String(v) },
        ].map(({ label, value, set, min, max, step, fmt }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{fmt(value)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Embedding Params</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>{embParams.toFixed(0)}M</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Compression</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#3D5240' }}>{vocabSize > 100000 ? 'High' : vocabSize > 32000 ? 'Medium' : 'Low'}</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Softmax Cost</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#D4A843' }}>{vocabSize > 128000 ? 'Heavy' : vocabSize > 50000 ? 'Moderate' : 'Light'}</div>
        </div>
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Reference models</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
          {MODELS.map(m => (
            <div key={m.name} style={{ fontSize: '0.7rem', color: '#5A6B5C' }}>
              <div style={{ fontWeight: 600, color: '#2C3E2D' }}>{m.name}</div>
              <div>{(m.vocab / 1000).toFixed(0)}K vocab</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
