import { useState, useMemo } from 'react';

const TOKENS = [
  { token: 'mat', logit: 4.2 },
  { token: 'floor', logit: 3.1 },
  { token: 'couch', logit: 2.5 },
  { token: 'roof', logit: 1.0 },
  { token: 'table', logit: 0.8 },
  { token: 'moon', logit: -0.5 },
  { token: 'quantum', logit: -2.1 },
  { token: 'zebra', logit: -3.0 },
];

function softmax(logits: number[]): number[] {
  const maxVal = Math.max(...logits);
  const exps = logits.map(z => Math.exp(z - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

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

export default function TopKTopPExplorer() {
  const [topK, setTopK] = useState(4);
  const [topP, setTopP] = useState(0.9);
  const [mode, setMode] = useState<'top-k' | 'top-p'>('top-k');

  const probs = useMemo(() => softmax(TOKENS.map(t => t.logit)), []);
  const sorted = useMemo(() =>
    TOKENS.map((t, i) => ({ ...t, prob: probs[i] }))
      .sort((a, b) => b.prob - a.prob),
  [probs]);

  const filtered = useMemo(() => {
    if (mode === 'top-k') {
      return sorted.map((t, i) => ({ ...t, included: i < topK }));
    } else {
      let cumulative = 0;
      return sorted.map(t => {
        const wasIncluded = cumulative < topP;
        cumulative += t.prob;
        return { ...t, included: wasIncluded };
      });
    }
  }, [sorted, topK, topP, mode]);

  const includedSum = filtered.filter(t => t.included).reduce((s, t) => s + t.prob, 0);

  // Renormalized probabilities
  const renormalized = filtered.map(t => ({
    ...t,
    renormProb: t.included ? t.prob / includedSum : 0,
  }));

  const maxRenorm = Math.max(...renormalized.map(t => t.renormProb));

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Top-K & Top-P Sampling
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how top-k and nucleus (top-p) sampling filter the token distribution before selection.
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {(['top-k', 'top-p'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              border: `1px solid ${mode === m ? '#C76B4A' : '#E5DFD3'}`,
              background: mode === m ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
              color: mode === m ? '#C76B4A' : '#5A6B5C',
              fontWeight: mode === m ? 600 : 400,
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontFamily: "'Source Sans 3', system-ui, sans-serif",
            }}
          >
            {m === 'top-k' ? 'Top-K' : 'Top-P (Nucleus)'}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>
            {mode === 'top-k' ? 'K value' : 'P threshold'}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', fontWeight: 600, color: '#2C3E2D' }}>
            {mode === 'top-k' ? topK : topP.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={mode === 'top-k' ? 1 : 0.1}
          max={mode === 'top-k' ? 8 : 1.0}
          step={mode === 'top-k' ? 1 : 0.05}
          value={mode === 'top-k' ? topK : topP}
          onChange={e => mode === 'top-k' ? setTopK(parseInt(e.target.value)) : setTopP(parseFloat(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: `linear-gradient(to right, #8BA888, #D4A843, #C76B4A)`, borderRadius: '3px', outline: 'none', cursor: 'pointer' }}
        />
      </div>

      {/* Token bars */}
      <div style={{ marginBottom: '1rem' }}>
        {renormalized.map((tok) => (
          <div key={tok.token} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 54px', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 0', opacity: tok.included ? 1 : 0.3, transition: 'opacity 0.2s ease' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: tok.renormProb === maxRenorm && tok.included ? 600 : 400, color: tok.included ? '#2C3E2D' : '#7A8B7C', textAlign: 'right' }}>
              {tok.token}
            </span>
            <div style={{ height: '22px', background: '#F0EBE1', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.max(tok.renormProb * 100, tok.included ? 0.3 : 0)}%`,
                background: !tok.included ? '#C4BFB3' : tok.renormProb === maxRenorm ? 'linear-gradient(90deg, #C76B4A, #D4896D)' : 'linear-gradient(90deg, #8BA888, #A8C4A5)',
                borderRadius: '4px',
                transition: 'width 0.15s ease-out',
              }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: tok.included ? '#5A6B5C' : '#B0A898', textAlign: 'right' }}>
              {tok.included ? `${(tok.renormProb * 100).toFixed(1)}%` : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.8rem' }}>
        <span style={{ color: '#5A6B5C' }}>
          <strong>{filtered.filter(t => t.included).length}</strong> of {TOKENS.length} tokens kept
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#7A8B7C' }}>
          Coverage: {(includedSum * 100).toFixed(1)}% → renormalized to 100%
        </span>
      </div>
    </div>
  );
}
