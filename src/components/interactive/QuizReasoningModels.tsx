import { useState } from 'react';
export default function QuizReasoningModels() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const questions = [
    { text: 'Reasoning models like o1 and DeepSeek-R1 produce a hidden chain-of-thought before generating their visible response.', isTrue: true, explanation: 'These models generate extended internal reasoning traces (thinking tokens) that explore and verify solutions before producing the final user-visible answer.' },
    { text: 'Reasoning models are always better than standard models for every type of task, including simple factual questions.', isTrue: false, explanation: 'Reasoning models excel at complex multi-step problems but can be slower, more expensive, and sometimes overthink simple tasks. Standard models are often better for straightforward queries.' },
    { text: 'Reasoning models were trained using reinforcement learning to develop chain-of-thought reasoning without explicit reasoning demonstrations.', isTrue: true, explanation: 'Models like DeepSeek-R1 discovered effective reasoning strategies through RL reward signals alone, without being shown step-by-step reasoning examples during training.' },
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
