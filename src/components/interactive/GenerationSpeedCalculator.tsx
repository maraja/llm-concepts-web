import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function GenerationSpeedCalculator() {
  const [tokensPerSec, setTokensPerSec] = useState(40);
  const [targetTokens, setTargetTokens] = useState(500);
  const [batchSize, setBatchSize] = useState(1);

  const totalTime = useMemo(() => targetTokens / tokensPerSec, [targetTokens, tokensPerSec]);
  const throughput = tokensPerSec * batchSize;
  const wordsApprox = Math.round(targetTokens * 0.75);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Generation Speed Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Since autoregressive generation is sequential, output length directly determines latency.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Tokens/sec', value: tokensPerSec, set: setTokensPerSec, min: 5, max: 200, step: 5 },
          { label: 'Output length', value: targetTokens, set: setTargetTokens, min: 50, max: 4000, step: 50 },
          { label: 'Batch size', value: batchSize, set: setBatchSize, min: 1, max: 64, step: 1 },
        ].map(({ label, value, set, min, max, step }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Time to Generate</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 600, color: totalTime > 30 ? '#C76B4A' : '#3D5240' }}>
            {totalTime < 60 ? `${totalTime.toFixed(1)}s` : `${(totalTime / 60).toFixed(1)}m`}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#7A8B7C' }}>~{wordsApprox} words</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Throughput</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 600, color: '#D4A843' }}>
            {throughput.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#7A8B7C' }}>total tok/s (all batches)</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        Each token requires a full forward pass through the model. This is why autoregressive generation is <strong>fundamentally sequential</strong> — you can't skip ahead.
      </div>
    </div>
  );
}
