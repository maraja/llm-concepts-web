import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const labelStyle = {
  fontSize: '10px',
  fontWeight: 700 as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  color: '#6E8B6B',
};

const stages = [
  {
    name: 'User Query',
    icon: '💬',
    color: '#5B8DB8',
    data: '"What are the key benefits of transformer architecture over RNNs?"',
    detail: 'The user submits a natural language question. This raw text will be processed through the RAG pipeline to produce a grounded answer.',
  },
  {
    name: 'Embed Query',
    icon: '📐',
    color: '#9B7EC8',
    data: 'query → embedding model → [0.23, -0.15, 0.87, 0.41, -0.62, 0.11, ...]\n\n768-dimensional vector representation capturing semantic meaning.',
    detail: 'The query is passed through an embedding model (e.g., text-embedding-3-small) to produce a dense vector that captures semantic meaning.',
  },
  {
    name: 'Vector Search',
    icon: '🔍',
    color: '#D4A843',
    data: 'Searching 50,000 document chunks...\n\nTop results by cosine similarity:\n1. [0.94] "Transformers enable parallel processing..."\n2. [0.89] "Unlike RNNs, attention mechanisms..."\n3. [0.85] "Self-attention allows direct connections..."\n4. [0.71] "Sequence-to-sequence models evolved..."\n5. [0.63] "Training efficiency improved with..."',
    detail: 'The query embedding is compared against all document embeddings in the vector database using cosine similarity. Top-k most similar chunks are retrieved.',
  },
  {
    name: 'Rerank',
    icon: '📊',
    color: '#C76B4A',
    data: 'Cross-encoder reranking (query, document pairs):\n\n1. [0.97] "Unlike RNNs, attention mechanisms..." → kept\n2. [0.93] "Transformers enable parallel processing..." → kept\n3. [0.88] "Self-attention allows direct connections..." → kept\n4. [0.42] "Sequence-to-sequence models evolved..." → filtered\n5. [0.31] "Training efficiency improved with..." → filtered',
    detail: 'A cross-encoder reranker scores each (query, document) pair jointly for more accurate relevance scoring. Low-scoring results are filtered out.',
  },
  {
    name: 'Augment Prompt',
    icon: '📝',
    color: '#8BA888',
    data: 'System: Answer based on the provided context.\n\nContext:\n[1] Unlike RNNs, attention mechanisms allow...\n[2] Transformers enable parallel processing...\n[3] Self-attention allows direct connections...\n\nQuestion: What are the key benefits of transformer architecture over RNNs?',
    detail: 'The retrieved and reranked documents are inserted into the prompt as context. The original question is appended, creating a grounded prompt.',
  },
  {
    name: 'Generate',
    icon: '✨',
    color: '#2C3E2D',
    data: 'The transformer architecture offers several key advantages over RNNs:\n\n1. Parallelization: Unlike sequential RNN processing, transformers process all positions simultaneously [1][2].\n\n2. Long-range dependencies: Self-attention creates direct connections between any positions, avoiding the vanishing gradient problem [3].\n\n3. Scalability: Parallel computation enables efficient scaling to larger models and datasets [2].',
    detail: 'The LLM generates a response grounded in the retrieved context, with citations. This reduces hallucination by anchoring answers to source documents.',
  },
];

export default function RAGPipelineViz() {
  const [step, setStep] = useState(0);
  const current = stages[step];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          RAG Pipeline Visualization
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Step through a complete Retrieval-Augmented Generation pipeline, from query to grounded response.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        {stages.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button onClick={() => setStep(i)} style={{
              padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer',
              border: `1px solid ${step === i ? s.color : i <= step ? s.color + '44' : '#E5DFD3'}`,
              background: step === i ? s.color + '15' : i < step ? s.color + '08' : 'transparent',
              color: step === i ? s.color : i <= step ? s.color : '#B0A898',
              fontWeight: step === i ? 600 : 400,
              fontFamily: "'Source Sans 3', system-ui, sans-serif", whiteSpace: 'nowrap',
            }}>{s.icon} {s.name}</button>
            {i < stages.length - 1 && <span style={{ color: i < step ? '#8BA888' : '#E5DFD3', fontSize: '0.8rem' }}>→</span>}
          </div>
        ))}
      </div>

      <div style={{ background: current.color + '08', border: `1px solid ${current.color}33`, borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{current.icon}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: current.color }}>{current.name}</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#5A6B5C', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>{current.detail}</p>
        <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '0.8rem' }}>
          <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#F5F0E8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7 }}>{current.data}</pre>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: step === 0 ? 'not-allowed' : 'pointer',
          border: '1px solid #E5DFD3', background: 'transparent', color: step === 0 ? '#B0A898' : '#5A6B5C',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Back</button>
        <button onClick={() => setStep(Math.min(stages.length - 1, step + 1))} disabled={step === stages.length - 1} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: step === stages.length - 1 ? 'not-allowed' : 'pointer',
          border: '1px solid #C76B4A', background: step === stages.length - 1 ? '#E5DFD3' : 'rgba(199, 107, 74, 0.08)',
          color: step === stages.length - 1 ? '#B0A898' : '#C76B4A', fontWeight: 600,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Next Stage</button>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#7A8B7C' }}>
          {step + 1} / {stages.length}
        </span>
      </div>
    </div>
  );
}
