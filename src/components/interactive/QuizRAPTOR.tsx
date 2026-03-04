import { useState } from 'react';
export default function QuizRAPTOR() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const questions = [
    { text: 'RAPTOR builds a hierarchical tree of document summaries, where leaf nodes are original text chunks and higher nodes are progressively broader summaries.', isTrue: true, explanation: 'RAPTOR recursively clusters and summarizes text chunks into a tree structure, enabling retrieval at different levels of abstraction from specific details to high-level themes.' },
    { text: 'RAPTOR can only answer questions about specific details found in individual text chunks, not broader thematic questions.', isTrue: false, explanation: 'A key strength of RAPTOR is answering questions at multiple abstraction levels — the tree structure allows retrieving both fine-grained chunks and high-level summary nodes.' },
    { text: 'RAPTOR uses clustering algorithms to group semantically related text chunks before summarizing them into parent nodes.', isTrue: true, explanation: 'RAPTOR clusters chunk embeddings (e.g., using Gaussian Mixture Models) to identify related content, then uses an LLM to generate summary nodes for each cluster.' },
  ];
  return (
    <div style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif", background: '#FDFBF7', border: '1px solid #E5DFD3', borderRadius: '14px', padding: '1.5rem', margin: '2rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>✦</span>
        <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: '1rem', fontWeight: 600, color: '#2C3E2D' }}>Quick Check</span>
        <span style={{ fontSize: '0.7rem', color: '#8BA888', fontFamily: "'JetBrains Mono', monospace", marginLeft: 'auto' }}>
          {Object.keys(answers).length}/{questions.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {questions.map((q, i) => (
          <div key={i} style={{ background: answers[i] !== undefined ? (answers[i] === q.isTrue ? '#f0f7f0' : '#fdf0ed') : '#F0EBE1', borderRadius: '10px', padding: '0.875rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#2C3E2D', margin: 0, lineHeight: 1.5 }}>{q.text}</p>
            {answers[i] === undefined ? (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => setAnswers(a => ({ ...a, [i]: true }))} style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #E5DFD3', background: 'white', cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: '#2C3E2D' }}>True</button>
                <button onClick={() => setAnswers(a => ({ ...a, [i]: false }))} style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #E5DFD3', background: 'white', cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: '#2C3E2D' }}>False</button>
              </div>
            ) : (
              <p style={{ fontSize: '0.78rem', color: answers[i] === q.isTrue ? '#4a7c59' : '#C76B4A', marginTop: '0.375rem', marginBottom: 0, lineHeight: 1.4 }}>
                {answers[i] === q.isTrue ? '✓ ' : '✗ '}{q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
