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

const documents = [
  { id: 1, text: 'Neural networks learn by adjusting weights through backpropagation.', vec: [0.82, 0.71, 0.15, -0.32, 0.44] },
  { id: 2, text: 'Transformers use self-attention to process sequences in parallel.', vec: [0.78, 0.65, 0.28, -0.18, 0.52] },
  { id: 3, text: 'The recipe calls for two cups of flour and one egg.', vec: [-0.45, -0.32, 0.88, 0.72, -0.11] },
  { id: 4, text: 'Gradient descent optimizes model parameters to minimize loss.', vec: [0.85, 0.73, 0.11, -0.28, 0.39] },
  { id: 5, text: 'Paris is the capital city of France, known for the Eiffel Tower.', vec: [-0.22, 0.15, 0.35, 0.91, 0.67] },
  { id: 6, text: 'Embedding models map text into dense vector representations.', vec: [0.75, 0.68, 0.22, -0.15, 0.48] },
  { id: 7, text: 'The stock market experienced significant volatility today.', vec: [-0.11, 0.25, 0.42, 0.55, 0.78] },
  { id: 8, text: 'Deep learning requires large datasets and compute resources.', vec: [0.79, 0.62, 0.18, -0.25, 0.41] },
];

const queries: Record<string, { text: string; vec: number[] }> = {
  ml: { text: 'How do neural networks learn?', vec: [0.84, 0.69, 0.12, -0.30, 0.42] },
  geo: { text: 'Tell me about European capitals', vec: [-0.20, 0.18, 0.32, 0.89, 0.65] },
  food: { text: 'What ingredients do I need for baking?', vec: [-0.42, -0.28, 0.85, 0.70, -0.08] },
};

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export default function EmbeddingSimilarityDemo() {
  const [queryKey, setQueryKey] = useState('ml');
  const [topK, setTopK] = useState(3);

  const query = queries[queryKey];
  const scored = documents
    .map(doc => ({ ...doc, similarity: cosineSim(query.vec, doc.vec) }))
    .sort((a, b) => b.similarity - a.similarity);

  const maxSim = Math.max(...scored.map(d => d.similarity));

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Embedding Similarity Search
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Enter a query, see it embedded, and watch cosine similarity scores computed against documents. Top-K results are highlighted.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {Object.entries(queries).map(([key, q]) => (
          <button key={key} onClick={() => setQueryKey(key)} style={{
            padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
            border: `1px solid ${queryKey === key ? '#C76B4A' : '#E5DFD3'}`,
            background: queryKey === key ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: queryKey === key ? '#C76B4A' : '#5A6B5C', fontWeight: queryKey === key ? 600 : 400,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>{q.text}</button>
        ))}
      </div>

      <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '0.5rem' }}>
        <div style={{ ...labelStyle, color: '#8BA888', marginBottom: '0.3rem' }}>Query Embedding (5D preview)</div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#F5F0E8' }}>
          [{query.vec.map(v => v.toFixed(2)).join(', ')}]
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>Top-K: {topK}</span>
        <input type="range" min={1} max={8} step={1} value={topK} onChange={e => setTopK(parseInt(e.target.value))}
          style={{ width: '120px', height: '4px', appearance: 'none', WebkitAppearance: 'none', background: '#D4A843', borderRadius: '2px', cursor: 'pointer' }}
        />
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        {scored.map((doc, rank) => {
          const isTopK = rank < topK;
          const barWidth = Math.max(0, (doc.similarity / maxSim) * 100);
          return (
            <div key={doc.id} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr 180px 54px', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.5rem', marginBottom: '0.3rem', borderRadius: '6px', transition: 'all 0.2s ease',
              background: isTopK ? 'rgba(139, 168, 136, 0.06)' : 'transparent',
              border: `1px solid ${isTopK ? '#8BA88833' : 'transparent'}`,
              opacity: isTopK ? 1 : 0.45,
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: isTopK ? '#8BA888' : '#B0A898', fontWeight: 700, textAlign: 'center' }}>
                #{rank + 1}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.4 }}>{doc.text}</span>
              <div style={{ height: '14px', background: '#F0EBE1', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${barWidth}%`, borderRadius: '4px', transition: 'width 0.3s ease',
                  background: isTopK ? (rank === 0 ? 'linear-gradient(90deg, #C76B4A, #D4896D)' : 'linear-gradient(90deg, #8BA888, #A8C4A5)') : '#C4BFB3',
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: isTopK ? '#2C3E2D' : '#B0A898', textAlign: 'right', fontWeight: isTopK ? 600 : 400 }}>
                {doc.similarity.toFixed(3)}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.6rem 0.8rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        Retrieving top {topK} of {documents.length} documents. Similarity range: {scored[scored.length - 1].similarity.toFixed(3)} to {scored[0].similarity.toFixed(3)}
      </div>
    </div>
  );
}
