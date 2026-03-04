import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const ARCHS = [
  {
    name: 'Encoder-Only',
    example: 'BERT, RoBERTa',
    attention: 'Bidirectional',
    bestFor: 'Understanding (classification, NER, embeddings)',
    training: 'Masked Language Modeling',
    generation: 'Cannot generate text autoregressively',
    blocks: [{ type: 'encoder', label: 'Encoder ×12' }],
    color: '#8BA888',
  },
  {
    name: 'Decoder-Only',
    example: 'GPT, LLaMA, Claude',
    attention: 'Causal (left-to-right)',
    bestFor: 'Generation (chat, code, reasoning)',
    training: 'Next-Token Prediction',
    generation: 'Generates one token at a time',
    blocks: [{ type: 'decoder', label: 'Decoder ×32' }],
    color: '#C76B4A',
  },
  {
    name: 'Encoder-Decoder',
    example: 'T5, BART, original Transformer',
    attention: 'Bidirectional encoder + causal decoder + cross-attention',
    bestFor: 'Seq-to-seq (translation, summarization)',
    training: 'Denoising / seq-to-seq objective',
    generation: 'Encoder processes input, decoder generates output',
    blocks: [{ type: 'encoder', label: 'Encoder ×6' }, { type: 'cross', label: '→' }, { type: 'decoder', label: 'Decoder ×6' }],
    color: '#D4A843',
  },
];

export default function ArchitectureComparison() {
  const [selected, setSelected] = useState(1);
  const arch = ARCHS[selected];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Three Architecture Paradigms
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare the three main transformer architectures and see why decoder-only won for LLMs.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {ARCHS.map((a, i) => (
          <button key={a.name} onClick={() => setSelected(i)} style={{
            flex: 1, padding: '0.5rem', borderRadius: '8px',
            border: `1px solid ${selected === i ? a.color : '#E5DFD3'}`,
            background: selected === i ? a.color + '10' : 'transparent',
            color: selected === i ? a.color : '#5A6B5C',
            fontWeight: selected === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', textAlign: 'center',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {a.name}
          </button>
        ))}
      </div>

      {/* Architecture blocks */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {arch.blocks.map((block, i) => (
          block.type === 'cross' ? (
            <span key={i} style={{ fontSize: '1.5rem', color: '#D4A843' }}>→</span>
          ) : (
            <div key={i} style={{
              padding: '1rem 1.5rem', borderRadius: '8px',
              background: block.type === 'encoder' ? '#8BA88820' : '#C76B4A15',
              border: `1px solid ${block.type === 'encoder' ? '#8BA88840' : '#C76B4A30'}`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: block.type === 'encoder' ? '#3D5240' : '#C76B4A', fontWeight: 600 }}>
                {block.label}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
                {block.type === 'encoder' ? 'Bidirectional' : 'Causal'}
              </div>
            </div>
          )
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'Example Models', value: arch.example },
            { label: 'Attention Type', value: arch.attention },
            { label: 'Best For', value: arch.bestFor },
            { label: 'Training', value: arch.training },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '0.82rem', color: '#2C3E2D', fontWeight: 500, marginTop: '0.15rem' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: selected === 1 ? '#C76B4A08' : '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        {selected === 1
          ? <><strong style={{ color: '#C76B4A' }}>Why decoder-only won:</strong> Simpler architecture, scales better, unified training objective, and emergent abilities at scale.</>
          : <>{arch.generation}</>
        }
      </div>
    </div>
  );
}
