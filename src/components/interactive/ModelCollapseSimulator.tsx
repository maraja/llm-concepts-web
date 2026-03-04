import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

function gaussian(x: number, mean: number, std: number): number {
  return Math.exp(-0.5 * Math.pow((x - mean) / std, 2)) / (std * Math.sqrt(2 * Math.PI));
}

export default function ModelCollapseSimulator() {
  const [generation, setGeneration] = useState(0);
  const [initialStd, setInitialStd] = useState(2.0);

  const maxGen = 10;

  const distributions = useMemo(() => {
    const gens = [];
    for (let g = 0; g <= maxGen; g++) {
      // Each generation: std shrinks, mean drifts, tails diminish
      const shrinkFactor = Math.pow(0.82, g);
      const driftFactor = g * 0.15;
      const currentStd = initialStd * shrinkFactor;
      const currentMean = driftFactor;

      const points = [];
      for (let x = -6; x <= 6; x += 0.1) {
        const density = gaussian(x, currentMean, currentStd);
        points.push({ x, density });
      }

      // Calculate quality metrics
      const effectiveSupport = currentStd * 4; // approximate range covering 95%
      const tailDensity = gaussian(initialStd * 2.5, currentMean, currentStd) / gaussian(initialStd * 2.5, 0, initialStd);
      const kl = g === 0 ? 0 : Math.log(initialStd / currentStd) + (currentStd * currentStd + currentMean * currentMean) / (2 * initialStd * initialStd) - 0.5;

      gens.push({
        gen: g,
        std: currentStd,
        mean: currentMean,
        points,
        effectiveSupport,
        tailDensity: Math.min(tailDensity, 1),
        klDivergence: kl,
        diversity: Math.max(0, (1 - g * 0.08) * 100),
        quality: Math.max(0, 100 - g * g * 1.5),
      });
    }
    return gens;
  }, [initialStd]);

  const current = distributions[generation];
  const original = distributions[0];

  const chartWidth = 500;
  const chartHeight = 150;
  const padLeft = 10;
  const padBottom = 20;
  const padTop = 10;
  const padRight = 10;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const maxDensity = Math.max(...original.points.map(p => p.density)) * 1.1;

  const toX = (x: number) => padLeft + ((x + 6) / 12) * plotW;
  const toY = (d: number) => padTop + plotH - (d / maxDensity) * plotH;

  const makePath = (points: Array<{ x: number; density: number }>) => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.x).toFixed(1)} ${toY(p.density).toFixed(1)}`).join(' ');
  };

  const originalPath = makePath(original.points);
  const currentPath = makePath(current.points);

  // Fill path for current distribution
  const currentFill = currentPath + ` L ${toX(6).toFixed(1)} ${toY(0).toFixed(1)} L ${toX(-6).toFixed(1)} ${toY(0).toFixed(1)} Z`;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Model Collapse Simulator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch how recursively training on AI-generated data causes the distribution to narrow and lose diversity over generations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Generation</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>Gen {generation}</span>
          </div>
          <input type="range" min={0} max={maxGen} step={1} value={generation}
            onChange={e => setGeneration(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Initial Spread</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{initialStd.toFixed(1)}</span>
          </div>
          <input type="range" min={0.5} max={3.0} step={0.1} value={initialStd}
            onChange={e => setInitialStd(parseFloat(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #C76B4A, #8BA888)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Step buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button onClick={() => setGeneration(0)} style={{
          padding: '0.35rem 0.7rem', borderRadius: '6px', border: '1px solid #E5DFD3',
          background: '#FDFBF7', color: '#5A6B5C', fontSize: '0.72rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Reset</button>
        <button onClick={() => setGeneration(Math.max(0, generation - 1))} disabled={generation === 0} style={{
          padding: '0.35rem 0.7rem', borderRadius: '6px', border: '1px solid #E5DFD3',
          background: generation === 0 ? '#F0EBE1' : '#FDFBF7', color: generation === 0 ? '#7A8B7C' : '#5A6B5C',
          fontSize: '0.72rem', fontWeight: 600, cursor: generation === 0 ? 'default' : 'pointer',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Previous</button>
        <button onClick={() => setGeneration(Math.min(maxGen, generation + 1))} disabled={generation === maxGen} style={{
          padding: '0.35rem 0.7rem', borderRadius: '6px', border: `1px solid ${generation === maxGen ? '#E5DFD3' : '#8BA888'}`,
          background: generation === maxGen ? '#F0EBE1' : '#8BA88815', color: generation === maxGen ? '#7A8B7C' : '#3D5240',
          fontSize: '0.72rem', fontWeight: 600, cursor: generation === maxGen ? 'default' : 'pointer',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Next Generation</button>
      </div>

      {/* Distribution chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>
          Data distribution after {generation} generation{generation !== 1 ? 's' : ''} of recursive training
        </div>
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ display: 'block' }}>
          {/* Baseline */}
          <line x1={padLeft} y1={toY(0)} x2={chartWidth - padRight} y2={toY(0)} stroke="#E5DFD3" strokeWidth={1} />

          {/* Original distribution (ghost) */}
          <path d={originalPath} fill="none" stroke="#8BA888" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />

          {/* Current distribution fill */}
          <path d={currentFill} fill="#C76B4A" opacity={0.1} />

          {/* Current distribution line */}
          <path d={currentPath} fill="none" stroke="#C76B4A" strokeWidth={2.5} strokeLinecap="round" />

          {/* Axis labels */}
          <text x={toX(-6)} y={chartHeight - 3} fontSize={8} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace">-6</text>
          <text x={toX(0)} y={chartHeight - 3} fontSize={8} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">0</text>
          <text x={toX(6)} y={chartHeight - 3} fontSize={8} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace" textAnchor="end">6</text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#5A6B5C' }}>
            <div style={{ width: 14, height: 2, borderTop: '2px dashed #8BA888' }} />
            Original
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#5A6B5C' }}>
            <div style={{ width: 14, height: 3, background: '#C76B4A', borderRadius: 2 }} />
            Gen {generation}
          </div>
        </div>
      </div>

      {/* Quality metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Std Dev</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: current.std > initialStd * 0.6 ? '#3D5240' : current.std > initialStd * 0.3 ? '#D4A843' : '#C76B4A' }}>
            {current.std.toFixed(2)}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>KL Divergence</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: current.klDivergence < 0.5 ? '#3D5240' : current.klDivergence < 2 ? '#D4A843' : '#C76B4A' }}>
            {current.klDivergence.toFixed(2)}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Diversity</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: current.diversity > 70 ? '#3D5240' : current.diversity > 40 ? '#D4A843' : '#C76B4A' }}>
            {current.diversity.toFixed(0)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Quality</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: current.quality > 70 ? '#3D5240' : current.quality > 40 ? '#D4A843' : '#C76B4A' }}>
            {current.quality.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Generation progress bar */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', color: '#7A8B7C', marginBottom: '0.4rem' }}>Collapse progression</div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {distributions.map((d, i) => (
            <div key={i} style={{
              flex: 1, height: '20px', borderRadius: '3px',
              background: i <= generation
                ? i < 3 ? '#8BA888' : i < 6 ? '#D4A843' : '#C76B4A'
                : '#E5DFD3',
              opacity: i <= generation ? 1 : 0.4,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }} onClick={() => setGeneration(i)} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', fontSize: '0.6rem', color: '#7A8B7C' }}>
          <span>Gen 0</span>
          <span>Gen {maxGen}</span>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> {generation === 0
          ? 'Generation 0 is the original real data distribution with full diversity and tail coverage.'
          : generation <= 3
          ? 'Early generations show subtle narrowing. The tails begin to shrink as the model slightly underrepresents rare examples in its synthetic outputs.'
          : generation <= 6
          ? 'Model collapse is accelerating. The distribution has noticeably narrowed, losing representation of minority data. Generated text becomes more homogeneous.'
          : 'Severe model collapse. The distribution has concentrated around the mean, losing most tail diversity. This is why recursive AI training without real data injection is dangerous.'}
      </div>
    </div>
  );
}
