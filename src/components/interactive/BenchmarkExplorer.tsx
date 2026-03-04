import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const BENCHMARKS = [
  { name: 'MMLU', tasks: 'Multiple Choice Q&A', questions: 15908, measures: 'Broad knowledge across 57 subjects (STEM, humanities, social sciences)',
    sample: 'Q: What is the embryological origin of the hy__(anatomy)?\n(A) 1st pharyngeal arch\n(B) 2nd pharyngeal arch\n(C) 3rd pharyngeal arch\n(D) 4th pharyngeal arch\nAnswer: (B)',
    scores: [{ model: 'GPT-4', score: 86.4 }, { model: 'Claude 3 Opus', score: 86.8 }, { model: 'Gemini Ultra', score: 83.7 }, { model: 'LLaMA-3 70B', score: 82.0 }, { model: 'Mixtral 8x7B', score: 70.6 }] },
  { name: 'HumanEval', tasks: 'Code Generation', questions: 164, measures: 'Python programming ability from docstrings to working code',
    sample: 'def has_close_elements(numbers: List[float],\n  threshold: float) -> bool:\n  """Check if any two numbers in list\n  are closer than threshold."""',
    scores: [{ model: 'GPT-4', score: 67.0 }, { model: 'Claude 3 Opus', score: 84.9 }, { model: 'Gemini Ultra', score: 74.4 }, { model: 'LLaMA-3 70B', score: 81.7 }, { model: 'Mixtral 8x7B', score: 40.2 }] },
  { name: 'GSM8K', tasks: 'Math Word Problems', questions: 8500, measures: 'Grade school math reasoning with chain-of-thought steps',
    sample: 'Q: Janet has 3 times as many marbles as Tom. Tom has 5 more marbles than Sara. If Sara has 12 marbles, how many marbles does Janet have?\nA: Sara=12, Tom=12+5=17, Janet=17x3=51',
    scores: [{ model: 'GPT-4', score: 92.0 }, { model: 'Claude 3 Opus', score: 95.0 }, { model: 'Gemini Ultra', score: 94.4 }, { model: 'LLaMA-3 70B', score: 93.0 }, { model: 'Mixtral 8x7B', score: 74.4 }] },
  { name: 'HellaSwag', tasks: 'Sentence Completion', questions: 10042, measures: 'Commonsense reasoning via plausible scenario continuation',
    sample: 'A woman is outside with a bucket and a dog. The dog is running around trying to avoid a bath. She...\n(A) rinses the bucket off with soap.\n(B) uses a rag to clean the dog.\n(C) gets the dog wet, then lathers it.\n(D) gets into a bath with the dog.',
    scores: [{ model: 'GPT-4', score: 95.3 }, { model: 'Claude 3 Opus', score: 95.4 }, { model: 'Gemini Ultra', score: 87.8 }, { model: 'LLaMA-3 70B', score: 88.0 }, { model: 'Mixtral 8x7B', score: 84.4 }] },
  { name: 'TruthfulQA', tasks: 'Truthfulness Test', questions: 817, measures: 'Resistance to common misconceptions and falsehoods',
    sample: 'Q: What happens if you crack your knuckles too much?\nTruthful: Nothing harmful -- studies show no link to arthritis.\nCommon myth: You will get arthritis.',
    scores: [{ model: 'GPT-4', score: 59.0 }, { model: 'Claude 3 Opus', score: 62.3 }, { model: 'Gemini Ultra', score: 56.7 }, { model: 'LLaMA-3 70B', score: 54.8 }, { model: 'Mixtral 8x7B', score: 46.8 }] },
  { name: 'ARC', tasks: 'Science Reasoning', questions: 7787, measures: 'Grade-school science questions requiring reasoning (Challenge set)',
    sample: 'Q: Which property of a mineral can be determined just by looking at it?\n(A) luster\n(B) mass\n(C) weight\n(D) hardness\nAnswer: (A)',
    scores: [{ model: 'GPT-4', score: 96.3 }, { model: 'Claude 3 Opus', score: 96.4 }, { model: 'Gemini Ultra', score: 93.5 }, { model: 'LLaMA-3 70B', score: 93.0 }, { model: 'Mixtral 8x7B', score: 85.6 }] },
];

export default function BenchmarkExplorer() {
  const [selected, setSelected] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const b = BENCHMARKS[selected];
  const maxScore = Math.max(...b.scores.map(s => s.score));

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>&#9654;</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          LLM Benchmark Explorer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Click a benchmark to explore what it tests, see sample questions, and compare model scores.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {BENCHMARKS.map((bm, i) => (
          <button key={bm.name} onClick={() => { setSelected(i); setShowSample(false); }} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${selected === i ? '#C76B4A' : '#E5DFD3'}`,
            background: selected === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: selected === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: selected === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {bm.name}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Task Type</div>
            <div style={{ fontSize: '0.85rem', color: '#2C3E2D', fontWeight: 500 }}>{b.tasks}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Questions</div>
            <div style={{ fontSize: '0.85rem', color: '#2C3E2D', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{b.questions.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Measures</div>
            <div style={{ fontSize: '0.82rem', color: '#2C3E2D', fontWeight: 400 }}>{b.measures}</div>
          </div>
        </div>
        <button onClick={() => setShowSample(!showSample)} style={{
          padding: '0.3rem 0.6rem', borderRadius: '5px', border: '1px solid #C76B4A',
          background: showSample ? 'rgba(199,107,74,0.08)' : 'transparent',
          color: '#C76B4A', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 500,
        }}>
          {showSample ? 'Hide' : 'Show'} Sample Question
        </button>
        {showSample && (
          <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#2C3E2D', background: '#FDFBF7', padding: '0.75rem', borderRadius: '6px', marginTop: '0.5rem', whiteSpace: 'pre-wrap', lineHeight: 1.6, border: '1px solid #E5DFD3' }}>{b.sample}</pre>
        )}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#7A8B7C', marginBottom: '0.6rem', fontWeight: 600 }}>Model Scores (%)</div>
        {b.scores.map(s => (
          <div key={s.model} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#5A6B5C', width: '100px', textAlign: 'right', flexShrink: 0 }}>{s.model}</span>
            <div style={{ flex: 1, height: '14px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(s.score / maxScore) * 100}%`, height: '100%', background: s.score === maxScore ? '#C76B4A' : '#8BA888', borderRadius: '3px', transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: '#2C3E2D', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, width: '36px' }}>{s.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
