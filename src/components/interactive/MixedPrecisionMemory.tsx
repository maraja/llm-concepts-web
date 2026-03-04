import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function MixedPrecisionMemory() {
  const [paramsBillions, setParamsBillions] = useState(7);
  const [batchSize, setBatchSize] = useState(8);
  const [seqLen, setSeqLen] = useState(2048);
  const [useBF16, setUseBF16] = useState(true);

  const calc = useMemo(() => {
    const params = paramsBillions * 1e9;
    const bytesPerFP32 = 4;
    const bytesPerFP16 = 2;

    // FP32 training memory breakdown (bytes)
    const fp32Weights = params * bytesPerFP32;
    const fp32Gradients = params * bytesPerFP32;
    // Adam optimizer: momentum + variance = 2x params in FP32
    const fp32Optimizer = params * bytesPerFP32 * 2;
    // Activations rough estimate: ~12 * hidden * seq * batch * layers (simplified)
    const hiddenSize = Math.round(Math.sqrt(params / 120) * 1); // rough estimate
    const numLayers = Math.round(paramsBillions * 4);
    const fp32Activations = 12 * hiddenSize * seqLen * batchSize * numLayers * bytesPerFP32;

    // Mixed precision memory breakdown
    const mpWeightsMaster = params * bytesPerFP32; // Master weights in FP32
    const mpWeightsHalf = params * bytesPerFP16; // Half-precision copy
    const mpGradients = params * bytesPerFP16; // Gradients in FP16
    const mpOptimizer = params * bytesPerFP32 * 2; // Optimizer states stay FP32
    const mpActivations = 12 * hiddenSize * seqLen * batchSize * numLayers * bytesPerFP16;

    const fp32Total = fp32Weights + fp32Gradients + fp32Optimizer + fp32Activations;
    const mpTotal = mpWeightsMaster + mpWeightsHalf + mpGradients + mpOptimizer + mpActivations;

    return {
      fp32: {
        weights: fp32Weights,
        gradients: fp32Gradients,
        optimizer: fp32Optimizer,
        activations: fp32Activations,
        total: fp32Total,
      },
      mp: {
        weightsMaster: mpWeightsMaster,
        weightsHalf: mpWeightsHalf,
        gradients: mpGradients,
        optimizer: mpOptimizer,
        activations: mpActivations,
        total: mpTotal,
      },
      savings: ((1 - mpTotal / fp32Total) * 100),
      throughputGain: (fp32Total / mpTotal).toFixed(1),
    };
  }, [paramsBillions, batchSize, seqLen]);

  const formatGB = (bytes: number) => {
    if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`;
    return `${(bytes / 1e9).toFixed(1)} GB`;
  };

  const maxVal = Math.max(calc.fp32.total, calc.mp.total);

  const fp32Segments = [
    { label: 'Weights', value: calc.fp32.weights, color: '#C76B4A' },
    { label: 'Gradients', value: calc.fp32.gradients, color: '#D4A843' },
    { label: 'Optimizer', value: calc.fp32.optimizer, color: '#8BA888' },
    { label: 'Activations', value: calc.fp32.activations, color: '#7A8B7C' },
  ];

  const mpSegments = [
    { label: 'Master Wts', value: calc.mp.weightsMaster, color: '#C76B4A' },
    { label: 'FP16 Wts', value: calc.mp.weightsHalf, color: '#E09070' },
    { label: 'Gradients', value: calc.mp.gradients, color: '#D4A843' },
    { label: 'Optimizer', value: calc.mp.optimizer, color: '#8BA888' },
    { label: 'Activations', value: calc.mp.activations, color: '#7A8B7C' },
  ];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Mixed Precision Memory Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare memory usage between full FP32 training and mixed precision (FP16/BF16) training with a master copy.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Parameters', value: paramsBillions, set: setParamsBillions, min: 1, max: 70, step: 1, fmt: (v: number) => `${v}B` },
          { label: 'Batch Size', value: batchSize, set: setBatchSize, min: 1, max: 64, step: 1, fmt: (v: number) => String(v) },
          { label: 'Seq Length', value: seqLen, set: setSeqLen, min: 512, max: 8192, step: 512, fmt: (v: number) => v.toLocaleString() },
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

      {/* Format toggle */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
        {['BF16', 'FP16'].map(fmt => (
          <button key={fmt} onClick={() => setUseBF16(fmt === 'BF16')} style={{
            padding: '0.35rem 0.8rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
            border: `1px solid ${(useBF16 && fmt === 'BF16') || (!useBF16 && fmt === 'FP16') ? '#C76B4A' : '#E5DFD3'}`,
            background: (useBF16 && fmt === 'BF16') || (!useBF16 && fmt === 'FP16') ? '#C76B4A10' : 'transparent',
            color: (useBF16 && fmt === 'BF16') || (!useBF16 && fmt === 'FP16') ? '#C76B4A' : '#5A6B5C',
            fontWeight: (useBF16 && fmt === 'BF16') || (!useBF16 && fmt === 'FP16') ? 600 : 400,
            cursor: 'pointer',
          }}>
            {fmt}
          </button>
        ))}
      </div>

      {/* Stacked bar chart comparison */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem', fontWeight: 600 }}>MEMORY BREAKDOWN</div>

        {[
          { label: 'FP32', segments: fp32Segments, total: calc.fp32.total },
          { label: `Mixed (${useBF16 ? 'BF16' : 'FP16'})`, segments: mpSegments, total: calc.mp.total },
        ].map(row => (
          <div key={row.label} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{row.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#C76B4A', fontWeight: 600 }}>{formatGB(row.total)}</span>
            </div>
            <div style={{ display: 'flex', height: '28px', borderRadius: '4px', overflow: 'hidden' }}>
              {row.segments.map(seg => (
                <div key={seg.label} style={{
                  width: `${(seg.value / maxVal) * 100}%`,
                  background: seg.color,
                  transition: 'width 0.3s ease',
                  minWidth: seg.value > 0 ? '2px' : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {(seg.value / maxVal) > 0.08 && (
                    <span style={{ fontSize: '0.5rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{seg.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {[
            { label: 'Weights', color: '#C76B4A' },
            { label: 'Gradients', color: '#D4A843' },
            { label: 'Optimizer', color: '#8BA888' },
            { label: 'Activations', color: '#7A8B7C' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
              <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Memory Saved</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{calc.savings.toFixed(0)}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Throughput Est.</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{calc.throughputGain}x</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>FP32 Total</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{formatGB(calc.fp32.total)}</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#3D524010', borderRadius: '6px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        <strong>Key insight:</strong> Mixed precision keeps a master FP32 copy of weights and optimizer states, but stores gradients and activations in half precision. The biggest savings come from activations, which scale with batch size and sequence length.
      </div>
    </div>
  );
}
