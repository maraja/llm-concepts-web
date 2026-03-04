import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function WarmupEffectDemo() {
  const [warmupRatio, setWarmupRatio] = useState(0.05);
  const [peakLR, setPeakLR] = useState(3e-4);
  const totalSteps = 100;

  // Simulate training loss with and without warmup
  const { withWarmup, withoutWarmup, lrWithWarmup, lrWithout } = useMemo(() => {
    const withWarmupLoss: number[] = [];
    const withoutWarmupLoss: number[] = [];
    const lrWith: number[] = [];
    const lrWithout: number[] = [];
    const warmupSteps = Math.round(warmupRatio * totalSteps);

    // Seed for reproducible "randomness" using simple hash
    const pseudoRandom = (i: number, seed: number) => {
      const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    let lossWithWarmup = 8.0;
    let lossWithout = 8.0;

    for (let step = 0; step <= totalSteps; step++) {
      // LR schedule: warmup + cosine for withWarmup; full LR constant start + cosine for without
      let currentLR_warmup: number;
      if (step < warmupSteps && warmupSteps > 0) {
        currentLR_warmup = peakLR * (step / warmupSteps);
      } else {
        const decayStep = warmupSteps > 0 ? step - warmupSteps : step;
        const decayTotal = warmupSteps > 0 ? totalSteps - warmupSteps : totalSteps;
        currentLR_warmup = peakLR * 0.01 + 0.5 * peakLR * 0.99 * (1 + Math.cos(Math.PI * decayStep / decayTotal));
      }

      // Without warmup: full LR from step 0, cosine decay
      const currentLR_noWarmup = peakLR * 0.01 + 0.5 * peakLR * 0.99 * (1 + Math.cos(Math.PI * step / totalSteps));

      lrWith.push(currentLR_warmup);
      lrWithout.push(currentLR_noWarmup);

      // Simulate loss: smooth exponential decay + noise
      // Without warmup: high initial noise/instability due to large gradients early on
      const baseLossDecay = 8.0 * Math.exp(-step * 0.04);
      const convergenceFloor = 2.0;

      // With warmup: smooth, stable convergence
      const warmupNoise = 0.15 * pseudoRandom(step, 1);
      lossWithWarmup = Math.max(convergenceFloor, baseLossDecay + warmupNoise);

      // Without warmup: early instability -- loss spikes in first ~15% of training
      const noWarmupInstability = step < 15 ? (2.0 + 3.0 * pseudoRandom(step, 2)) * (peakLR / 3e-4) : 0;
      const noWarmupNoise = step < 15
        ? 0.8 * pseudoRandom(step, 3) * (peakLR / 3e-4)
        : 0.15 * pseudoRandom(step, 3);
      lossWithout = Math.max(convergenceFloor * 1.1, baseLossDecay + noWarmupInstability + noWarmupNoise);
      // Without warmup converges to slightly higher loss (damaged early training)
      if (step > 50) {
        lossWithout = Math.max(convergenceFloor * 1.15, lossWithout);
      }

      withWarmupLoss.push(lossWithWarmup);
      withoutWarmupLoss.push(lossWithout);
    }

    return { withWarmup: withWarmupLoss, withoutWarmup: withoutWarmupLoss, lrWithWarmup: lrWith, lrWithout: lrWithout };
  }, [warmupRatio, peakLR]);

  const maxLoss = Math.max(...withWarmup, ...withoutWarmup);
  const warmupSteps = Math.round(warmupRatio * totalSteps);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Warmup Effect on Training
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare training stability with and without learning rate warmup. Early high learning rates cause instability that damages convergence.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Warmup Ratio', value: warmupRatio, set: setWarmupRatio, min: 0, max: 0.2, step: 0.01, fmt: (v: number) => `${(v * 100).toFixed(0)}% (${Math.round(v * totalSteps)} steps)` },
          { label: 'Peak Learning Rate', value: peakLR, set: setPeakLR, min: 1e-4, max: 1e-3, step: 1e-5, fmt: (v: number) => v.toExponential(1) },
        ].map(({ label, value, set, min, max, step, fmt }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#C76B4A', fontWeight: 600 }}>{fmt(value)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      {/* LR schedule comparison */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Learning rate schedule
        </div>
        <div style={{ position: 'relative', height: '50px' }}>
          {lrWithWarmup.map((lr, i) => {
            const yFrac = 1 - (lr / peakLR);
            return (
              <div key={`w-${i}`} style={{
                position: 'absolute',
                left: `${(i / totalSteps) * 100}%`,
                top: `${yFrac * 100}%`,
                width: '3px', height: '3px', borderRadius: '50%',
                background: '#8BA888', opacity: 0.8,
                transform: 'translate(-50%, -50%)',
              }} />
            );
          })}
          {lrWithout.map((lr, i) => {
            const yFrac = 1 - (lr / peakLR);
            return (
              <div key={`nw-${i}`} style={{
                position: 'absolute',
                left: `${(i / totalSteps) * 100}%`,
                top: `${yFrac * 100}%`,
                width: '3px', height: '3px', borderRadius: '50%',
                background: '#C76B4A', opacity: 0.6,
                transform: 'translate(-50%, -50%)',
              }} />
            );
          })}
          {/* Warmup boundary */}
          {warmupSteps > 0 && (
            <div style={{
              position: 'absolute', left: `${(warmupSteps / totalSteps) * 100}%`,
              top: 0, bottom: 0, borderLeft: '1px dashed rgba(139, 168, 136, 0.5)',
            }} />
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8BA888' }} />
            <span style={{ fontSize: '0.62rem', color: '#5A6B5C' }}>With warmup</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C76B4A' }} />
            <span style={{ fontSize: '0.62rem', color: '#5A6B5C' }}>Without warmup</span>
          </div>
        </div>
      </div>

      {/* Loss curve comparison */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Training loss comparison
        </div>
        <div style={{ position: 'relative', height: '140px' }}>
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <div key={frac} style={{ position: 'absolute', top: `${frac * 100}%`, left: 0, right: 0, borderBottom: '1px dashed #E5DFD3' }} />
          ))}
          {/* Warmup zone */}
          {warmupSteps > 0 && (
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${(warmupSteps / totalSteps) * 100}%`,
              background: 'rgba(139, 168, 136, 0.08)',
              borderRight: '1px dashed rgba(139, 168, 136, 0.3)',
            }} />
          )}
          {/* With warmup loss dots */}
          {withWarmup.map((loss, i) => {
            const yFrac = (loss / maxLoss);
            return (
              <div key={`wl-${i}`} style={{
                position: 'absolute',
                left: `${(i / totalSteps) * 100}%`,
                bottom: `${(1 - yFrac) * 100}%`,
                width: '4px', height: '4px', borderRadius: '50%',
                background: '#8BA888', opacity: 0.8,
                transform: 'translate(-50%, 50%)',
              }} />
            );
          })}
          {/* Without warmup loss dots */}
          {withoutWarmup.map((loss, i) => {
            const yFrac = (loss / maxLoss);
            return (
              <div key={`nwl-${i}`} style={{
                position: 'absolute',
                left: `${(i / totalSteps) * 100}%`,
                bottom: `${(1 - yFrac) * 100}%`,
                width: '4px', height: '4px', borderRadius: '50%',
                background: '#C76B4A', opacity: 0.7,
                transform: 'translate(-50%, 50%)',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.3rem' }}>
          <span>Step 0</span>
          <span>Step {totalSteps}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'Final (warmup)', value: withWarmup[withWarmup.length - 1].toFixed(2), color: '#8BA888' },
          { label: 'Final (no warmup)', value: withoutWarmup[withoutWarmup.length - 1].toFixed(2), color: '#C76B4A' },
          { label: 'Early Max Spike', value: Math.max(...withoutWarmup.slice(0, 15)).toFixed(2), color: '#D4A843' },
          { label: 'Loss Gap', value: (withoutWarmup[withoutWarmup.length - 1] - withWarmup[withWarmup.length - 1]).toFixed(2), color: '#7A8B7C' },
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
          {warmupRatio === 0
            ? 'Without any warmup, training starts at full learning rate. Early gradients are noisy (random initialization), so large updates cause loss spikes and can permanently damage model weights. Even after the model recovers, the final loss is typically higher.'
            : warmupRatio < 0.03
            ? `Very short warmup (${warmupSteps} steps). This may not be enough to stabilize early gradients. Most LLM training uses 1-5% warmup. The optimizer's running statistics (like Adam's moments) also need time to warm up from their zero initialization.`
            : `${(warmupRatio * 100).toFixed(0)}% warmup gives the optimizer ${warmupSteps} steps to build accurate gradient statistics before reaching peak LR. This prevents the large, noisy updates in early training that would otherwise push the model into a bad region of the loss landscape.`}
        </div>
      </div>
    </div>
  );
}
