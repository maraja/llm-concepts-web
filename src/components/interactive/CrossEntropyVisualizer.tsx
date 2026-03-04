import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function CrossEntropyVisualizer() {
  const [prob, setProb] = useState(0.5);

  const metrics = useMemo(() => {
    const loss = -Math.log(prob);
    const lossBits = -Math.log2(prob);
    const perplexity = Math.pow(2, lossBits);
    return { loss, lossBits, perplexity };
  }, [prob]);

  // Generate -log(p) curve points
  const curvePoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (let p = 0.01; p <= 0.99; p += 0.01) {
      points.push({ x: p, y: -Math.log(p) });
    }
    return points;
  }, []);

  const maxLoss = -Math.log(0.01); // ~4.6

  // Sample probabilities for bar chart
  const sampleProbs = [0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Cross-Entropy Loss Curve
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how cross-entropy loss (-log p) penalizes low-confidence predictions exponentially. Move the slider to explore.
        </p>
      </div>

      {/* Probability slider */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>P(correct token)</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{prob.toFixed(2)}</span>
        </div>
        <input type="range" min={1} max={99} step={1} value={Math.round(prob * 100)}
          onChange={e => setProb(Number(e.target.value) / 100)}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
          <span>0.01 (uncertain)</span>
          <span>0.99 (confident)</span>
        </div>
      </div>

      {/* Loss curve visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          -log(p) curve
        </div>
        <div style={{ position: 'relative', height: '160px', marginBottom: '0.5rem' }}>
          {/* Y-axis labels */}
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {[4, 3, 2, 1, 0].map(v => (
              <span key={v} style={{ fontSize: '0.58rem', fontFamily: "'JetBrains Mono', monospace", color: '#7A8B7C', width: '20px', textAlign: 'right' }}>{v}</span>
            ))}
          </div>
          {/* Chart area */}
          <div style={{ position: 'absolute', left: '28px', right: '0', top: '0', bottom: '0' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => (
              <div key={frac} style={{ position: 'absolute', top: `${frac * 100}%`, left: 0, right: 0, borderBottom: '1px dashed #E5DFD3' }} />
            ))}
            {/* Curve rendered as thin bars */}
            <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
              {curvePoints.map((pt, i) => {
                const barH = Math.min((pt.y / maxLoss) * 100, 100);
                const isNearSelected = Math.abs(pt.x - prob) < 0.015;
                return (
                  <div key={i} style={{
                    flex: 1,
                    height: `${barH}%`,
                    background: isNearSelected ? '#C76B4A' : 'rgba(139, 168, 136, 0.5)',
                    minWidth: '1px',
                    transition: 'background 0.1s ease',
                  }} />
                );
              })}
            </div>
            {/* Current position marker */}
            <div style={{
              position: 'absolute',
              left: `${(prob - 0.01) / 0.98 * 100}%`,
              bottom: `${Math.min((-Math.log(prob) / maxLoss) * 100, 100)}%`,
              transform: 'translate(-50%, 50%)',
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#C76B4A', border: '2px solid #FDFBF7',
              zIndex: 2,
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', paddingLeft: '28px' }}>
          <span>p = 0.01</span>
          <span>p = 0.50</span>
          <span>p = 0.99</span>
        </div>
      </div>

      {/* Bar chart: loss at sample probabilities */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Loss at sample probabilities
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'flex-end', height: '80px' }}>
          {sampleProbs.map(p => {
            const loss = -Math.log(p);
            const barH = (loss / maxLoss) * 100;
            const isSelected = Math.abs(p - prob) < 0.02;
            return (
              <div key={p} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', color: isSelected ? '#C76B4A' : '#7A8B7C',
                  marginBottom: '0.15rem', fontWeight: isSelected ? 600 : 400,
                }}>{loss.toFixed(1)}</div>
                <div style={{
                  width: '100%', height: `${barH}%`,
                  background: isSelected ? '#C76B4A' : '#8BA888',
                  borderRadius: '3px 3px 0 0',
                  opacity: isSelected ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                }} />
                <span style={{ fontSize: '0.55rem', color: isSelected ? '#C76B4A' : '#7A8B7C', marginTop: '0.2rem', fontFamily: "'JetBrains Mono', monospace" }}>
                  {p}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Loss (-log p)</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{metrics.loss.toFixed(3)}</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>nats</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Bits</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{metrics.lossBits.toFixed(3)}</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>-log2(p)</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Perplexity</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{metrics.perplexity.toFixed(1)}</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>2^bits</div>
        </div>
      </div>

      {/* Insight box */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {prob < 0.1
            ? 'At very low confidence, loss explodes. A probability of 0.01 yields a loss of 4.6 -- the model is severely penalized for being wrong and confident.'
            : prob < 0.5
            ? 'In this range, loss decreases steadily but still significant. The model needs to push probability mass toward the correct token to reduce loss.'
            : prob > 0.9
            ? 'Near-perfect predictions yield near-zero loss. Notice how the curve flattens -- going from 0.9 to 0.99 saves much less loss than going from 0.1 to 0.2.'
            : 'At p=0.5, the model is as uncertain as a coin flip on this token. Loss is 0.69 nats (1 bit), meaning the model needs 1 bit of information to identify the correct token.'}
        </div>
      </div>
    </div>
  );
}
