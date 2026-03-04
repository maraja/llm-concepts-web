import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function LossLandscapeExplorer() {
  const [vocabSize, setVocabSize] = useState(50000);
  const [modelConfidence, setModelConfidence] = useState(0.85);

  const loss = useMemo(() => -Math.log(modelConfidence), [modelConfidence]);
  const perplexity = useMemo(() => Math.exp(loss), [loss]);
  const randomBaseline = Math.log(vocabSize);
  const improvementPct = ((1 - loss / randomBaseline) * 100).toFixed(1);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Cross-Entropy Loss & Perplexity
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Explore the relationship between prediction confidence, cross-entropy loss, and perplexity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Model confidence P(correct)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{(modelConfidence * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.001} max={0.999} step={0.001} value={modelConfidence}
            onChange={e => setModelConfidence(parseFloat(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #C76B4A, #D4A843, #8BA888)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Vocabulary size</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{(vocabSize / 1000).toFixed(0)}K</span>
          </div>
          <input type="range" min={1000} max={200000} step={1000} value={vocabSize}
            onChange={e => setVocabSize(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>CE Loss</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', fontWeight: 600, color: loss < 1 ? '#3D5240' : loss < 3 ? '#D4A843' : '#C76B4A' }}>
            {loss.toFixed(3)}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>-log(p) nats</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Perplexity</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', fontWeight: 600, color: perplexity < 5 ? '#3D5240' : perplexity < 20 ? '#D4A843' : '#C76B4A' }}>
            {perplexity < 1000 ? perplexity.toFixed(1) : `${(perplexity / 1000).toFixed(0)}K`}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>e^loss</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>vs. Random</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', fontWeight: 600, color: '#3D5240' }}>
            {improvementPct}%
          </div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>better than uniform</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Intuition:</strong> Perplexity = {perplexity.toFixed(1)} means the model is as "confused" as if choosing uniformly among ~{Math.round(perplexity)} tokens. Random baseline over {(vocabSize / 1000).toFixed(0)}K vocab = perplexity {vocabSize.toLocaleString()}.
      </div>
    </div>
  );
}
