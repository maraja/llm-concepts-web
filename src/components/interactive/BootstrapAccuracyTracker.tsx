import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

type ModelSize = 'small' | 'medium' | 'large';

const modelConfigs: Record<ModelSize, { label: string; params: string; baseAccuracy: number; learningRate: number; ceiling: number; color: string }> = {
  small: { label: 'Small', params: '7B', baseAccuracy: 25, learningRate: 0.25, ceiling: 72, color: '#D4A843' },
  medium: { label: 'Medium', params: '13B', baseAccuracy: 38, learningRate: 0.35, ceiling: 85, color: '#8BA888' },
  large: { label: 'Large', params: '70B', baseAccuracy: 52, learningRate: 0.4, ceiling: 94, color: '#C76B4A' },
};

export default function BootstrapAccuracyTracker() {
  const [iterations, setIterations] = useState(8);
  const [filterThreshold, setFilterThreshold] = useState(50);
  const [selectedModels, setSelectedModels] = useState<Set<ModelSize>>(new Set(['small', 'medium', 'large']));

  const modelData = useMemo(() => {
    const result: Record<ModelSize, Array<{ iter: number; accuracy: number; passRate: number; effectiveSamples: number }>> = {
      small: [],
      medium: [],
      large: [],
    };

    for (const size of ['small', 'medium', 'large'] as ModelSize[]) {
      const config = modelConfigs[size];
      const baseAcc = config.baseAccuracy;

      for (let i = 0; i <= iterations; i++) {
        // Accuracy grows with diminishing returns, capped by ceiling
        const rawAccuracy = baseAcc + (config.ceiling - baseAcc) * (1 - Math.exp(-config.learningRate * i));

        // Higher filter threshold = stricter filtering = higher quality but fewer samples
        const thresholdEffect = filterThreshold / 100;
        const accuracy = rawAccuracy * (0.85 + 0.15 * thresholdEffect);

        // Pass rate: what % of generated samples pass the filter
        // Higher accuracy = more pass, higher threshold = fewer pass
        const passRate = Math.max(5, accuracy * (1.1 - thresholdEffect * 0.5));

        // Effective samples for next round of training
        const totalGenerated = 10000;
        const effectiveSamples = Math.round(totalGenerated * passRate / 100);

        result[size].push({
          iter: i,
          accuracy: Math.min(accuracy, config.ceiling),
          passRate: Math.min(passRate, 98),
          effectiveSamples,
        });
      }
    }
    return result;
  }, [iterations, filterThreshold]);

  const chartWidth = 500;
  const chartHeight = 160;
  const padLeft = 40;
  const padBottom = 25;
  const padTop = 10;
  const padRight = 10;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const toX = (iter: number) => padLeft + (iter / iterations) * plotW;
  const toY = (acc: number) => padTop + plotH - ((acc - 10) / 95) * plotH;

  const makePath = (data: Array<{ iter: number; accuracy: number }>) => {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d.iter).toFixed(1)} ${toY(d.accuracy).toFixed(1)}`)
      .join(' ');
  };

  const toggleModel = (size: ModelSize) => {
    const next = new Set(selectedModels);
    if (next.has(size)) {
      if (next.size > 1) next.delete(size);
    } else {
      next.add(size);
    }
    setSelectedModels(next);
  };

  // Find current iteration data for the display
  const currentIter = iterations;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Bootstrap Accuracy Tracker
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Track how accuracy bootstraps up over self-improvement iterations. Compare different model sizes and filter thresholds.
        </p>
      </div>

      {/* Model selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {(Object.keys(modelConfigs) as ModelSize[]).map(size => {
          const config = modelConfigs[size];
          const active = selectedModels.has(size);
          return (
            <button key={size} onClick={() => toggleModel(size)} style={{
              padding: '0.4rem 0.8rem', borderRadius: '6px',
              border: `1px solid ${active ? config.color : '#E5DFD3'}`,
              background: active ? `${config.color}15` : '#FDFBF7',
              color: active ? config.color : '#7A8B7C',
              fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
              fontFamily: "'Source Sans 3', system-ui, sans-serif",
              transition: 'all 0.15s ease',
            }}>
              {config.label} ({config.params})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Iterations</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{iterations}</span>
          </div>
          <input type="range" min={1} max={15} step={1} value={iterations}
            onChange={e => setIterations(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Filter Strictness</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{filterThreshold}%</span>
          </div>
          <input type="range" min={20} max={90} step={5} value={filterThreshold}
            onChange={e => setFilterThreshold(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #C76B4A, #8BA888)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Accuracy chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Accuracy over self-improvement iterations</div>
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ display: 'block' }}>
          {/* Grid */}
          {[20, 40, 60, 80, 100].map(v => (
            <g key={v}>
              <line x1={padLeft} y1={toY(v)} x2={chartWidth - padRight} y2={toY(v)} stroke="#E5DFD3" strokeWidth={1} />
              <text x={padLeft - 5} y={toY(v) + 3} textAnchor="end" fontSize={8} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace">{v}%</text>
            </g>
          ))}
          {/* X labels */}
          {Array.from({ length: Math.min(iterations + 1, 16) }, (_, i) => {
            if (iterations > 10 && i % 2 !== 0 && i !== iterations) return null;
            return (
              <text key={i} x={toX(i)} y={chartHeight - 3} textAnchor="middle" fontSize={8} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace">{i}</text>
            );
          })}

          {/* Lines for each selected model */}
          {(Object.keys(modelConfigs) as ModelSize[]).map(size => {
            if (!selectedModels.has(size)) return null;
            const config = modelConfigs[size];
            const data = modelData[size];
            const path = makePath(data);
            return (
              <g key={size}>
                <path d={path} fill="none" stroke={config.color} strokeWidth={2.5} strokeLinecap="round" />
                {data.map(d => (
                  <circle key={d.iter} cx={toX(d.iter)} cy={toY(d.accuracy)} r={d.iter === currentIter ? 4 : 2.5} fill={config.color} stroke="#FDFBF7" strokeWidth={1} />
                ))}
              </g>
            );
          })}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
          {(Object.keys(modelConfigs) as ModelSize[]).filter(s => selectedModels.has(s)).map(size => (
            <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#5A6B5C' }}>
              <div style={{ width: 14, height: 3, background: modelConfigs[size].color, borderRadius: 2 }} />
              {modelConfigs[size].label} ({modelConfigs[size].params})
            </div>
          ))}
        </div>
      </div>

      {/* Pass rate bars */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>
          Filter pass rate at iteration {iterations} (% of samples retained)
        </div>
        {(Object.keys(modelConfigs) as ModelSize[]).filter(s => selectedModels.has(s)).map(size => {
          const config = modelConfigs[size];
          const data = modelData[size][iterations];
          return (
            <div key={size} style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#2C3E2D' }}>{config.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: config.color, fontWeight: 600 }}>
                  {data.passRate.toFixed(0)}% ({data.effectiveSamples.toLocaleString()} samples)
                </span>
              </div>
              <div style={{ height: '8px', background: '#E5DFD3', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${data.passRate}%`,
                  height: '100%',
                  background: config.color,
                  borderRadius: '4px',
                  transition: 'width 0.2s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Final accuracy comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedModels.size}, 1fr)`, gap: '0.5rem', marginBottom: '1rem' }}>
        {(Object.keys(modelConfigs) as ModelSize[]).filter(s => selectedModels.has(s)).map(size => {
          const config = modelConfigs[size];
          const finalData = modelData[size][iterations];
          const improvement = finalData.accuracy - config.baseAccuracy;
          return (
            <div key={size} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>{config.label} Final</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: config.color }}>
                {finalData.accuracy.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.6rem', color: '#3D5240' }}>+{improvement.toFixed(1)}pp gain</div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> {iterations <= 3
          ? 'Early iterations show the steepest gains. The model rapidly learns from its own correct solutions, bootstrapping reasoning capability from a modest starting point.'
          : filterThreshold > 70
          ? 'A strict filter produces high-quality training data but fewer samples per round. This trades training volume for data quality, often yielding better final accuracy.'
          : filterThreshold < 35
          ? 'A lenient filter retains more samples but includes lower-quality reasoning traces. This risks reinforcing errors, which can limit improvement or even cause regression.'
          : 'Larger models bootstrap more effectively because they start with higher base accuracy, generating more correct samples from the beginning. This creates a virtuous cycle: better starting point leads to better training data, which leads to larger gains.'}
      </div>
    </div>
  );
}
