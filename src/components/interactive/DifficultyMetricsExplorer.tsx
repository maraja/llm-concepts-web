import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

interface Example {
  text: string;
  perplexity: number;
  length: number;
  vocabComplexity: number;  // 0-1
  syntaxDepth: number;      // 0-1
}

const EXAMPLES: Example[] = [
  { text: 'The cat sat on the mat.', perplexity: 12, length: 6, vocabComplexity: 0.05, syntaxDepth: 0.15 },
  { text: 'She walked to the store and bought some milk.', perplexity: 18, length: 9, vocabComplexity: 0.1, syntaxDepth: 0.25 },
  { text: 'The quick brown fox jumps over the lazy dog.', perplexity: 25, length: 9, vocabComplexity: 0.15, syntaxDepth: 0.2 },
  { text: 'Despite the inclement weather, the expedition proceeded as planned.', perplexity: 45, length: 9, vocabComplexity: 0.55, syntaxDepth: 0.45 },
  { text: 'The algorithm recursively subdivides the search space using a binary partitioning scheme.', perplexity: 72, length: 12, vocabComplexity: 0.7, syntaxDepth: 0.5 },
  { text: 'Notwithstanding the aforementioned epistemological constraints, the phenomenological analysis yields compelling insights.', perplexity: 150, length: 11, vocabComplexity: 0.92, syntaxDepth: 0.7 },
  { text: 'The juxtaposition of quantum decoherence phenomena with macroscopic thermodynamic irreversibility presents nontrivial theoretical challenges.', perplexity: 220, length: 13, vocabComplexity: 0.95, syntaxDepth: 0.85 },
  { text: 'Contrafactual counterfactuals notwithstanding, the meta-ontological supervenience relation presupposes a priori necessitation.', perplexity: 380, length: 11, vocabComplexity: 0.98, syntaxDepth: 0.95 },
];

type Metric = 'perplexity' | 'vocabComplexity' | 'syntaxDepth' | 'combined';

const METRICS: { key: Metric; label: string; description: string }[] = [
  { key: 'perplexity', label: 'Perplexity', description: 'Model uncertainty on the example (higher = harder)' },
  { key: 'vocabComplexity', label: 'Vocabulary', description: 'Rarity and complexity of words used (higher = harder)' },
  { key: 'syntaxDepth', label: 'Syntax Depth', description: 'Structural complexity of the sentence (higher = harder)' },
  { key: 'combined', label: 'Combined', description: 'Weighted average of all metrics' },
];

export default function DifficultyMetricsExplorer() {
  const [metric, setMetric] = useState<Metric>('perplexity');
  const [threshold, setThreshold] = useState(50);

  const getDifficultyScore = (ex: Example, m: Metric): number => {
    switch (m) {
      case 'perplexity': return Math.min(ex.perplexity / 400, 1);
      case 'vocabComplexity': return ex.vocabComplexity;
      case 'syntaxDepth': return ex.syntaxDepth;
      case 'combined': return (Math.min(ex.perplexity / 400, 1) + ex.vocabComplexity + ex.syntaxDepth) / 3;
    }
  };

  const scored = useMemo(() =>
    EXAMPLES.map(ex => ({
      ...ex,
      score: getDifficultyScore(ex, metric),
    })).sort((a, b) => a.score - b.score),
  [metric]);

  const thresholdNorm = threshold / 100;
  const passing = scored.filter(s => s.score <= thresholdNorm);
  const failing = scored.filter(s => s.score > thresholdNorm);

  const getDisplayValue = (ex: Example, m: Metric): string => {
    switch (m) {
      case 'perplexity': return ex.perplexity.toFixed(0);
      case 'vocabComplexity': return (ex.vocabComplexity * 100).toFixed(0) + '%';
      case 'syntaxDepth': return (ex.syntaxDepth * 100).toFixed(0) + '%';
      case 'combined': return (getDifficultyScore(ex, 'combined') * 100).toFixed(0) + '%';
    }
  };

  const currentMetricInfo = METRICS.find(m => m.key === metric)!;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Difficulty Metrics Explorer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Explore how different difficulty metrics rank training examples. Adjust the threshold to filter which examples enter training at each stage.
        </p>
      </div>

      {/* Metric selector */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {METRICS.map(m => (
          <button key={m.key} onClick={() => setMetric(m.key)} style={{
            padding: '0.35rem 0.65rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
            border: `1px solid ${metric === m.key ? '#C76B4A' : '#E5DFD3'}`,
            background: metric === m.key ? 'rgba(199, 107, 74, 0.06)' : 'transparent',
            color: metric === m.key ? '#C76B4A' : '#5A6B5C',
            fontWeight: metric === m.key ? 600 : 400,
            cursor: 'pointer',
          }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '0.75rem', color: '#5A6B5C', marginBottom: '1rem', fontStyle: 'italic' }}>
        {currentMetricInfo.description}
      </div>

      {/* Threshold slider */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Difficulty threshold</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{threshold}%</span>
        </div>
        <input type="range" min={5} max={100} step={1} value={threshold}
          onChange={e => setThreshold(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.15rem' }}>
          <span>Only easiest</span>
          <span>Include all</span>
        </div>
      </div>

      {/* Examples list */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>
          Training examples (sorted by {currentMetricInfo.label.toLowerCase()})
        </div>
        {scored.map((ex, i) => {
          const passes = ex.score <= thresholdNorm;
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 60px 50px',
              alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.4rem',
              borderBottom: i < scored.length - 1 ? '1px solid #E5DFD3' : 'none',
              opacity: passes ? 1 : 0.35,
              transition: 'opacity 0.2s ease',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#2C3E2D', fontWeight: passes ? 500 : 400, lineHeight: 1.4 }}>
                  {ex.text}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>PPL: {ex.perplexity}</span>
                  <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Vocab: {(ex.vocabComplexity * 100).toFixed(0)}%</span>
                  <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Syntax: {(ex.syntaxDepth * 100).toFixed(0)}%</span>
                </div>
              </div>
              {/* Difficulty bar */}
              <div>
                <div style={{ height: '10px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${ex.score * 100}%`,
                    background: ex.score > 0.7 ? '#C76B4A' : ex.score > 0.35 ? '#D4A843' : '#8BA888',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                color: passes ? '#3D5240' : '#C76B4A',
                fontWeight: 600, textAlign: 'right',
              }}>
                {getDisplayValue(ex, metric)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Included</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#3D5240' }}>{passing.length}/{scored.length}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Filtered Out</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>{failing.length}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Avg Difficulty</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>
            {passing.length > 0 ? (passing.reduce((s, p) => s + p.score, 0) / passing.length * 100).toFixed(0) + '%' : '-'}
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> Different difficulty metrics can disagree on ranking. A short sentence with rare vocabulary might have high vocab complexity but low syntax depth. Perplexity-based metrics are model-dependent: what's "hard" for a small model may be trivial for a larger one. Curriculum learning research often uses a combination of metrics.
      </div>
    </div>
  );
}
