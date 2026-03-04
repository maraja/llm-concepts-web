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
  { name: 'Word2Vec', dim: 300, vocab: 3000000, year: 2013 },
  { name: 'GPT-2 S', dim: 768, vocab: 50257, year: 2019 },
  { name: 'BERT-base', dim: 768, vocab: 30522, year: 2018 },
  { name: 'GPT-2 XL', dim: 1600, vocab: 50257, year: 2019 },
  { name: 'LLaMA 7B', dim: 4096, vocab: 32000, year: 2023 },
  { name: 'LLaMA 70B', dim: 8192, vocab: 32000, year: 2023 },
];

export default function EmbeddingDimExplorer() {
  const [dim, setDim] = useState(4096);
  const [vocabSize, setVocabSize] = useState(32000);

  const params = useMemo(() => (dim * vocabSize) / 1e6, [dim, vocabSize]);
  const bitsPerToken = dim * 32; // float32
  const maxDim = 8192;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Embedding Dimensions
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Higher dimensions capture more nuance but cost more memory. The embedding matrix is vocab × dim.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Embedding Dim', value: dim, set: setDim, min: 64, max: maxDim, step: 64, fmt: (v: number) => String(v) },
          { label: 'Vocab Size', value: vocabSize, set: setVocabSize, min: 1000, max: 256000, step: 1000, fmt: (v: number) => `${(v / 1000).toFixed(0)}K` },
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

      {/* Dimension visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Single token vector ({dim} dimensions)
        </div>
        <div style={{ display: 'flex', gap: '1px', height: '24px', marginBottom: '0.5rem' }}>
          {Array.from({ length: Math.min(80, Math.ceil(dim / (maxDim / 80))) }, (_, i) => (
            <div key={i} style={{
              flex: 1, background: `hsl(${140 + (i * 60 / 80)}, 35%, ${50 + Math.sin(i * 0.3) * 15}%)`,
              borderRadius: i === 0 ? '3px 0 0 3px' : i === Math.min(79, Math.ceil(dim / (maxDim / 80)) - 1) ? '0 3px 3px 0' : '0',
              minWidth: '1px',
            }} />
          ))}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C' }}>
          Each bar = ~{Math.ceil(dim / 80)} dimensions. Total: {(bitsPerToken / 8).toLocaleString()} bytes per token (float32).
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Matrix Size</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{params.toFixed(0)}M</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>parameters</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Memory</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{(params * 4 / 1000).toFixed(1)}GB</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>float32</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Per Token</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{(dim * 4 / 1024).toFixed(1)}KB</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>vector size</div>
        </div>
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>Reference</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {MODELS.map(m => (
            <span key={m.name} style={{ fontSize: '0.65rem', color: '#5A6B5C' }}>
              <span style={{ fontWeight: 600 }}>{m.name}</span>: {m.dim}d
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
