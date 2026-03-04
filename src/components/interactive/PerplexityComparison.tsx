import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function PerplexityComparison() {
  const [vocabSize, setVocabSize] = useState(50000);
  const [modelConfidence, setModelConfidence] = useState(0.7);
  const [contextQuality, setContextQuality] = useState(0.5);

  const scenarios = useMemo(() => {
    const randomPerplexity = vocabSize;
    const unigramPerplexity = Math.pow(vocabSize, 0.45); // Simulated unigram baseline
    // Model perplexity depends on confidence -- higher confidence = lower perplexity
    const modelCE = -modelConfidence * Math.log2(modelConfidence) - (1 - modelConfidence) * Math.log2((1 - modelConfidence) / (vocabSize - 1));
    const modelPerplexity = Math.pow(2, modelCE);
    // With good context, perplexity drops further
    const contextBoost = 1 - contextQuality * 0.6;
    const contextualPerplexity = modelPerplexity * contextBoost;

    return [
      { name: 'Random Guess', perplexity: randomPerplexity, color: '#7A8B7C', desc: 'Uniform distribution over vocab' },
      { name: 'Unigram Model', perplexity: unigramPerplexity, color: '#D4A843', desc: 'Frequency-based only' },
      { name: 'Trained Model', perplexity: modelPerplexity, color: '#8BA888', desc: `${(modelConfidence * 100).toFixed(0)}% top-token confidence` },
      { name: 'With Context', perplexity: contextualPerplexity, color: '#C76B4A', desc: 'Context-aware prediction' },
    ];
  }, [vocabSize, modelConfidence, contextQuality]);

  const maxPerp = Math.max(...scenarios.map(s => s.perplexity));
  const logMaxPerp = Math.log10(maxPerp);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Perplexity Comparison
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare perplexity across model scenarios. Lower perplexity means the model is less "surprised" by the text.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Vocab Size', value: vocabSize, set: setVocabSize, min: 1000, max: 256000, step: 1000, fmt: (v: number) => `${(v / 1000).toFixed(0)}K` },
          { label: 'Model Confidence', value: modelConfidence, set: setModelConfidence, min: 0.05, max: 0.95, step: 0.05, fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
          { label: 'Context Quality', value: contextQuality, set: setContextQuality, min: 0, max: 1, step: 0.05, fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
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

      {/* Perplexity bar comparison (log scale) */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#7A8B7C', fontWeight: 600 }}>Perplexity comparison (log scale)</span>
          <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>lower = better</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {scenarios.map(s => {
            const logPerp = Math.log10(Math.max(s.perplexity, 1));
            const barWidth = (logPerp / logMaxPerp) * 100;
            return (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#2C3E2D', fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: s.color, fontWeight: 600 }}>
                    {s.perplexity >= 1000 ? `${(s.perplexity / 1000).toFixed(1)}K` : s.perplexity.toFixed(1)}
                  </span>
                </div>
                <div style={{ height: '18px', background: 'rgba(229, 223, 211, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    background: s.color,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                    opacity: 0.8,
                  }} />
                </div>
                <div style={{ fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.1rem' }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Random Baseline</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#7A8B7C' }}>{vocabSize >= 1000 ? `${(vocabSize / 1000).toFixed(0)}K` : vocabSize}</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>= vocab size</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Model PPL</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{scenarios[2].perplexity.toFixed(1)}</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{(scenarios[2].perplexity / vocabSize * 100).toFixed(2)}% of random</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Improvement</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{(vocabSize / scenarios[3].perplexity).toFixed(0)}x</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>vs random</div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {modelConfidence > 0.8
            ? `High confidence (${(modelConfidence * 100).toFixed(0)}%) yields low perplexity. The model effectively narrows ${vocabSize.toLocaleString()} choices to ~${scenarios[3].perplexity.toFixed(0)} equally-likely options.`
            : modelConfidence < 0.3
            ? 'Low model confidence results in high perplexity. The model is spreading probability too thin, barely improving over simple frequency baselines.'
            : `Perplexity of ${scenarios[3].perplexity.toFixed(1)} means the model is as uncertain as choosing uniformly from ~${Math.round(scenarios[3].perplexity)} tokens. Good context helps narrow predictions further.`}
        </div>
      </div>
    </div>
  );
}
