import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function GradientClippingDemo() {
  const [maxNorm, setMaxNorm] = useState(1.0);
  const [spikeFrequency, setSpikeFrequency] = useState(0.15);
  const [spikeIntensity, setSpikeIntensity] = useState(5.0);

  const numSteps = 80;

  // Generate gradient norms over training steps with occasional spikes
  const { rawNorms, clippedNorms, rawLoss, clippedLoss } = useMemo(() => {
    const raw: number[] = [];
    const clipped: number[] = [];
    const rLoss: number[] = [];
    const cLoss: number[] = [];

    // Deterministic pseudo-random
    const pseudoRandom = (i: number, seed: number) => {
      const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    let rawLossVal = 6.0;
    let clippedLossVal = 6.0;

    for (let i = 0; i < numSteps; i++) {
      // Base gradient norm: starts around 2, decreases with training
      const baseNorm = 0.3 + 1.5 * Math.exp(-i * 0.03) + 0.2 * pseudoRandom(i, 1);

      // Spikes
      const isSpike = pseudoRandom(i, 2) < spikeFrequency;
      const spikeScale = isSpike ? spikeIntensity * (0.5 + pseudoRandom(i, 3)) : 1.0;
      const rawNorm = baseNorm * spikeScale;

      raw.push(rawNorm);
      clipped.push(Math.min(rawNorm, maxNorm));

      // Simulate loss: raw gradients cause instability on spikes
      const rawDecay = 0.03 * (isSpike ? 0.5 : 1); // spikes slow learning
      rawLossVal = rawLossVal * (1 - rawDecay) + (isSpike ? 0.5 * spikeScale * 0.1 : 0) + 0.05 * pseudoRandom(i, 4);
      rawLossVal = Math.max(2.5, rawLossVal);

      const clipDecay = 0.035; // clipping enables stable, faster learning
      clippedLossVal = clippedLossVal * (1 - clipDecay) + 0.03 * pseudoRandom(i, 5);
      clippedLossVal = Math.max(2.0, clippedLossVal);

      rLoss.push(rawLossVal);
      cLoss.push(clippedLossVal);
    }

    return { rawNorms: raw, clippedNorms: clipped, rawLoss: rLoss, clippedLoss: cLoss };
  }, [maxNorm, spikeFrequency, spikeIntensity]);

  const maxRawNorm = Math.max(...rawNorms);
  const numClipped = clippedNorms.filter((c, i) => c < rawNorms[i]).length;
  const avgRawNorm = rawNorms.reduce((a, b) => a + b, 0) / rawNorms.length;
  const avgClippedNorm = clippedNorms.reduce((a, b) => a + b, 0) / clippedNorms.length;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Gradient Clipping
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Gradient clipping caps the gradient norm to prevent exploding gradients. Watch how spikes are tamed while normal updates pass through unchanged.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Max Gradient Norm', value: maxNorm, set: setMaxNorm, min: 0.1, max: 5.0, step: 0.1, fmt: (v: number) => v.toFixed(1) },
          { label: 'Spike Frequency', value: spikeFrequency, set: setSpikeFrequency, min: 0.0, max: 0.4, step: 0.05, fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
          { label: 'Spike Intensity', value: spikeIntensity, set: setSpikeIntensity, min: 1.0, max: 15.0, step: 0.5, fmt: (v: number) => `${v.toFixed(1)}x` },
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

      {/* Gradient norms visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#7A8B7C', fontWeight: 600 }}>Gradient norms over training</span>
          <span style={{ fontSize: '0.62rem', color: '#7A8B7C' }}>Red bars = clipped</span>
        </div>
        <div style={{ position: 'relative', height: '120px' }}>
          {/* Clipping threshold line */}
          <div style={{
            position: 'absolute',
            bottom: `${(maxNorm / maxRawNorm) * 100}%`,
            left: 0, right: 0,
            borderBottom: '2px dashed #C76B4A',
            zIndex: 2,
          }}>
            <span style={{
              position: 'absolute', right: 0, top: '-14px',
              fontSize: '0.55rem', fontFamily: "'JetBrains Mono', monospace",
              color: '#C76B4A', fontWeight: 600,
            }}>clip={maxNorm.toFixed(1)}</span>
          </div>
          {/* Raw norm bars */}
          <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '100%' }}>
            {rawNorms.map((norm, i) => {
              const barH = (norm / maxRawNorm) * 100;
              const wasClipped = clippedNorms[i] < norm;
              const clippedH = (clippedNorms[i] / maxRawNorm) * 100;
              return (
                <div key={i} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {/* Portion above clip threshold (would be clipped) */}
                  {wasClipped && (
                    <div style={{
                      height: `${barH - clippedH}%`,
                      background: 'rgba(199, 107, 74, 0.3)',
                      borderRadius: '2px 2px 0 0',
                      minWidth: '2px',
                    }} />
                  )}
                  {/* Portion below clip threshold (passes through) */}
                  <div style={{
                    height: `${wasClipped ? clippedH : barH}%`,
                    background: wasClipped ? '#C76B4A' : '#8BA888',
                    borderRadius: wasClipped ? '0' : '2px 2px 0 0',
                    opacity: wasClipped ? 0.8 : 0.6,
                    minWidth: '2px',
                  }} />
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.3rem' }}>
          <span>Step 0</span>
          <span>Step {numSteps}</span>
        </div>
      </div>

      {/* Loss comparison */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Training loss: clipped vs unclipped
        </div>
        <div style={{ position: 'relative', height: '80px' }}>
          {/* Loss dots */}
          {rawLoss.map((loss, i) => {
            const maxLoss = Math.max(...rawLoss, ...clippedLoss);
            const minLoss = Math.min(...rawLoss, ...clippedLoss) * 0.9;
            const yFrac = (loss - minLoss) / (maxLoss - minLoss);
            return (
              <div key={`raw-${i}`} style={{
                position: 'absolute',
                left: `${(i / numSteps) * 100}%`,
                bottom: `${(1 - yFrac) * 100}%`,
                width: '3px', height: '3px', borderRadius: '50%',
                background: '#D4A843', opacity: 0.6,
                transform: 'translate(-50%, 50%)',
              }} />
            );
          })}
          {clippedLoss.map((loss, i) => {
            const maxLoss = Math.max(...rawLoss, ...clippedLoss);
            const minLoss = Math.min(...rawLoss, ...clippedLoss) * 0.9;
            const yFrac = (loss - minLoss) / (maxLoss - minLoss);
            return (
              <div key={`clip-${i}`} style={{
                position: 'absolute',
                left: `${(i / numSteps) * 100}%`,
                bottom: `${(1 - yFrac) * 100}%`,
                width: '3px', height: '3px', borderRadius: '50%',
                background: '#8BA888', opacity: 0.8,
                transform: 'translate(-50%, 50%)',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4A843' }} />
            <span style={{ fontSize: '0.62rem', color: '#5A6B5C' }}>Without clipping</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8BA888' }} />
            <span style={{ fontSize: '0.62rem', color: '#5A6B5C' }}>With clipping</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'Steps Clipped', value: `${numClipped}/${numSteps}`, color: '#C76B4A' },
          { label: 'Max Raw Norm', value: maxRawNorm.toFixed(2), color: '#D4A843' },
          { label: 'Avg Raw Norm', value: avgRawNorm.toFixed(2), color: '#7A8B7C' },
          { label: 'Avg Clipped', value: avgClippedNorm.toFixed(2), color: '#8BA888' },
        ].map(s => (
          <div key={s.label} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {maxNorm < 0.5
            ? `Very aggressive clipping (max_norm=${maxNorm.toFixed(1)}) clips ${numClipped} of ${numSteps} steps. While this prevents explosions, it also limits learning speed by shrinking normal-sized gradients. Most LLM training uses max_norm=1.0.`
            : maxNorm > 3.0
            ? `Loose clipping (max_norm=${maxNorm.toFixed(1)}) only catches the worst spikes (${numClipped} clipped). Gradient spikes above ${maxNorm.toFixed(1)} can still cause instability. LLMs typically use max_norm between 0.5 and 1.0.`
            : `Gradient clipping at max_norm=${maxNorm.toFixed(1)} clipped ${numClipped} of ${numSteps} steps, preserving the direction of large gradients while scaling their magnitude. The gradient is rescaled as: g * (max_norm / ||g||) when ||g|| exceeds the threshold.`}
        </div>
      </div>
    </div>
  );
}
