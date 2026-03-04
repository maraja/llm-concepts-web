import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function OptimizerMemoryCalculator() {
  const [paramsB, setParamsB] = useState(7);
  const [precision, setPrecision] = useState<'fp32' | 'mixed'>('mixed');

  const memory = useMemo(() => {
    const totalParams = paramsB * 1e9;
    const bytesPerParam = precision === 'fp32' ? 4 : 2; // fp16 for mixed precision weights
    const bytesPerOptState = 4; // optimizer states always fp32

    // Weights
    const weightsMem = totalParams * bytesPerParam;
    // Gradients (same precision as weights in forward, but fp32 for accumulation)
    const gradientsMem = totalParams * bytesPerParam;
    // Adam states: m (first moment) and v (second moment), always fp32
    const mMem = totalParams * bytesPerOptState;
    const vMem = totalParams * bytesPerOptState;
    // Mixed precision: master weights in fp32
    const masterWeightsMem = precision === 'mixed' ? totalParams * 4 : 0;

    const sgdTotal = weightsMem + gradientsMem;
    const sgdMomTotal = weightsMem + gradientsMem + mMem + (precision === 'mixed' ? masterWeightsMem : 0);
    const adamTotal = weightsMem + gradientsMem + mMem + vMem + (precision === 'mixed' ? masterWeightsMem : 0);

    return {
      weights: weightsMem / 1e9,
      gradients: gradientsMem / 1e9,
      m: mMem / 1e9,
      v: vMem / 1e9,
      masterWeights: masterWeightsMem / 1e9,
      sgdTotal: sgdTotal / 1e9,
      sgdMomTotal: sgdMomTotal / 1e9,
      adamTotal: adamTotal / 1e9,
      perParamBytes: precision === 'fp32' ? 16 : 18, // Adam: weights(2)+grads(2)+m(4)+v(4)+master(4)=16 mixed or weights(4)+grads(4)+m(4)+v(4)=16 fp32
    };
  }, [paramsB, precision]);

  const maxMem = memory.adamTotal;
  const barMax = Math.max(maxMem, 1);

  const components = [
    { label: 'Weights', value: memory.weights, color: '#8BA888', desc: precision === 'mixed' ? 'FP16' : 'FP32' },
    { label: 'Gradients', value: memory.gradients, color: '#5A6B5C', desc: precision === 'mixed' ? 'FP16' : 'FP32' },
    { label: '1st Moment (m)', value: memory.m, color: '#D4A843', desc: 'FP32 always' },
    { label: '2nd Moment (v)', value: memory.v, color: '#C76B4A', desc: 'FP32 always' },
    ...(precision === 'mixed' ? [{ label: 'Master Weights', value: memory.masterWeights, color: '#7A8B7C', desc: 'FP32 copy' }] : []),
  ];

  const gpuOptions = [
    { name: 'A100 40GB', mem: 40 },
    { name: 'A100 80GB', mem: 80 },
    { name: 'H100 80GB', mem: 80 },
  ];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Adam Optimizer Memory
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Adam stores two extra states per parameter (first and second moments). See how optimizer memory often exceeds model weight memory.
        </p>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Model Parameters</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{paramsB}B</span>
        </div>
        <input type="range" min={1} max={70} step={1} value={paramsB}
          onChange={e => setParamsB(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
          <span>1B</span>
          <span>70B</span>
        </div>
      </div>

      {/* Precision selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {([['fp32', 'Full FP32'], ['mixed', 'Mixed Precision']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setPrecision(key)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${precision === key ? '#C76B4A' : '#E5DFD3'}`,
            background: precision === key ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: precision === key ? '#C76B4A' : '#5A6B5C',
            fontWeight: precision === key ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Memory breakdown bars */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem', fontWeight: 600 }}>
          Memory breakdown (Adam optimizer)
        </div>
        {/* Stacked bar */}
        <div style={{ height: '30px', display: 'flex', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
          {components.map(c => (
            <div key={c.label} style={{
              width: `${(c.value / maxMem) * 100}%`,
              background: c.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.55rem', color: '#FDFBF7', fontWeight: 600,
              minWidth: c.value > 0 ? '2px' : '0',
              transition: 'width 0.3s ease',
            }}>
              {(c.value / maxMem) * 100 > 12 ? `${c.value.toFixed(0)}GB` : ''}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {components.map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: c.color }} />
              <span style={{ fontSize: '0.62rem', color: '#5A6B5C' }}>{c.label}: {c.value.toFixed(1)}GB ({c.desc})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual component bars */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Per-component memory
        </div>
        {components.map(c => (
          <div key={c.label} style={{ marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#2C3E2D' }}>{c.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: c.color, fontWeight: 600 }}>{c.value.toFixed(1)} GB</span>
            </div>
            <div style={{ height: '10px', background: 'rgba(229, 223, 211, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${(c.value / barMax) * 100}%`,
                height: '100%', background: c.color, borderRadius: '4px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Optimizer comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'SGD', value: memory.sgdTotal, color: '#7A8B7C', note: 'W + G' },
          { label: 'SGD+Momentum', value: memory.sgdMomTotal, color: '#D4A843', note: 'W + G + m' },
          { label: 'Adam/AdamW', value: memory.adamTotal, color: '#C76B4A', note: 'W + G + m + v' },
        ].map(opt => (
          <div key={opt.label} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{opt.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: opt.color }}>{opt.value.toFixed(0)} GB</div>
            <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{opt.note}</div>
          </div>
        ))}
      </div>

      {/* GPU fit */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>GPU Requirement (Adam)</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {gpuOptions.map(gpu => {
            const numGPUs = Math.ceil(memory.adamTotal / gpu.mem);
            return (
              <span key={gpu.name} style={{ fontSize: '0.68rem', color: '#5A6B5C' }}>
                <span style={{ fontWeight: 600 }}>{gpu.name}</span>: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: numGPUs <= 1 ? '#8BA888' : '#C76B4A' }}>{numGPUs} GPU{numGPUs > 1 ? 's' : ''}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {paramsB >= 30
            ? `A ${paramsB}B parameter model needs ${memory.adamTotal.toFixed(0)}GB just for Adam optimizer states. The optimizer states (m + v = ${(memory.m + memory.v).toFixed(0)}GB) alone are ${(memory.m + memory.v > memory.weights ? 'larger' : 'comparable to')} the model weights. This is why large model training requires distributed strategies like ZeRO.`
            : `Adam requires ${(memory.adamTotal / memory.weights).toFixed(1)}x the memory of weights alone. For each parameter, Adam stores: the weight itself, its gradient, a running mean of gradients (m), and a running mean of squared gradients (v). Mixed precision adds FP32 master weights.`}
        </div>
      </div>
    </div>
  );
}
