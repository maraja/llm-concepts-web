import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

interface GPUType {
  name: string;
  tflops: number; // FP16/BF16 TFLOPS
  costPerHour: number;
  memoryGB: number;
}

const GPU_TYPES: GPUType[] = [
  { name: 'A100 80GB', tflops: 312, costPerHour: 2.00, memoryGB: 80 },
  { name: 'H100 80GB', tflops: 990, costPerHour: 3.50, memoryGB: 80 },
];

interface KnownModel {
  name: string;
  params: number;
  tokens: number;
  flops: number;
  cost: string;
}

const KNOWN_MODELS: KnownModel[] = [
  { name: 'GPT-3', params: 175, tokens: 300, flops: 3.14e23, cost: '$4.6M' },
  { name: 'LLaMA 2 70B', params: 70, tokens: 2000, flops: 8.4e23, cost: '$2.4M' },
  { name: 'LLaMA 3 405B', params: 405, tokens: 15000, flops: 3.8e25, cost: '$60M+' },
];

export default function TrainingCostEstimator() {
  const [paramsBillions, setParamsBillions] = useState(70);
  const [tokensBillions, setTokensBillions] = useState(2000);
  const [gpuIndex, setGpuIndex] = useState(1);
  const [utilization, setUtilization] = useState(0.40);

  const gpu = GPU_TYPES[gpuIndex];

  const calc = useMemo(() => {
    const params = paramsBillions * 1e9;
    const tokens = tokensBillions * 1e9;

    // Chinchilla scaling: C ~= 6 * N * D (FLOPs for forward + backward)
    const flops = 6 * params * tokens;

    // GPU throughput (accounting for utilization -- MFU)
    const effectiveTflops = gpu.tflops * utilization;
    const flopsPerSecond = effectiveTflops * 1e12;

    // Time calculation
    const totalSeconds = flops / flopsPerSecond;
    const gpuHours = totalSeconds / 3600;

    // Cost
    const totalCost = gpuHours * gpu.costPerHour;

    // Multi-GPU scenario
    const numGPUs = Math.max(1, Math.ceil(paramsBillions * 2 / gpu.memoryGB)); // rough: 2 bytes/param for weights
    const wallClockHours = gpuHours / numGPUs;
    const wallClockDays = wallClockHours / 24;

    return { flops, gpuHours, totalCost, numGPUs, wallClockDays, totalSeconds };
  }, [paramsBillions, tokensBillions, gpu, utilization]);

  const formatFlops = (f: number) => {
    if (f >= 1e25) return `${(f / 1e24).toFixed(1)}e24`;
    if (f >= 1e24) return `${(f / 1e24).toFixed(2)}e24`;
    if (f >= 1e23) return `${(f / 1e23).toFixed(1)}e23`;
    if (f >= 1e22) return `${(f / 1e22).toFixed(1)}e22`;
    if (f >= 1e21) return `${(f / 1e21).toFixed(1)}e21`;
    return `${(f / 1e20).toFixed(1)}e20`;
  };

  const formatCost = (c: number) => {
    if (c >= 1e6) return `$${(c / 1e6).toFixed(1)}M`;
    if (c >= 1e3) return `$${(c / 1e3).toFixed(0)}K`;
    return `$${c.toFixed(0)}`;
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Training Cost Estimator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Estimate the compute cost of pre-training an LLM from scratch using the Chinchilla FLOPs formula: C = 6ND.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Parameters</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{paramsBillions}B</span>
          </div>
          <input type="range" min={1} max={405} step={1} value={paramsBillions}
            onChange={e => setParamsBillions(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Training Tokens</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{tokensBillions >= 1000 ? `${(tokensBillions / 1000).toFixed(1)}T` : `${tokensBillions}B`}</span>
          </div>
          <input type="range" min={100} max={15000} step={100} value={tokensBillions}
            onChange={e => setTokensBillions(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* GPU selector */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D', marginBottom: '0.4rem' }}>GPU Type</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {GPU_TYPES.map((g, i) => (
              <button key={g.name} onClick={() => setGpuIndex(i)} style={{
                flex: 1,
                padding: '0.4rem 0.5rem', borderRadius: '5px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem',
                border: `1px solid ${gpuIndex === i ? '#C76B4A' : '#E5DFD3'}`,
                background: gpuIndex === i ? '#C76B4A10' : 'transparent',
                color: gpuIndex === i ? '#C76B4A' : '#5A6B5C',
                fontWeight: gpuIndex === i ? 600 : 400,
                cursor: 'pointer',
              }}>
                {g.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>GPU Utilization (MFU)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{(utilization * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.1} max={0.7} step={0.05} value={utilization}
            onChange={e => setUtilization(parseFloat(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #C76B4A, #8BA888)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total FLOPs</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>{formatFlops(calc.flops)}</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>GPU-Hours</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#D4A843' }}>
            {calc.gpuHours >= 1e6 ? `${(calc.gpuHours / 1e6).toFixed(1)}M` : `${(calc.gpuHours / 1e3).toFixed(0)}K`}
          </div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Estimated Cost</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#3D5240' }}>{formatCost(calc.totalCost)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Min GPUs Needed</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>{calc.numGPUs.toLocaleString()}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Wall Clock Time</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>
            {calc.wallClockDays >= 365 ? `${(calc.wallClockDays / 365).toFixed(1)} yrs` : `${calc.wallClockDays.toFixed(0)} days`}
          </div>
        </div>
      </div>

      {/* Comparison with known models */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>COMPARISON WITH KNOWN MODELS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
          {KNOWN_MODELS.map(model => {
            const yourFlops = calc.flops;
            const ratio = yourFlops / model.flops;
            return (
              <div key={model.name} style={{ padding: '0.5rem', background: '#FDFBF7', borderRadius: '6px', textAlign: 'center', border: '1px solid #E5DFD3' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#2C3E2D' }}>{model.name}</div>
                <div style={{ fontSize: '0.58rem', color: '#7A8B7C' }}>{model.params}B / {model.tokens >= 1000 ? `${(model.tokens / 1000).toFixed(0)}T` : `${model.tokens}B`} tok</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: ratio > 1 ? '#C76B4A' : '#8BA888', fontWeight: 600, marginTop: '0.2rem' }}>
                  {ratio >= 1 ? `${ratio.toFixed(1)}x more` : `${(1 / ratio).toFixed(1)}x less`}
                </div>
                <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>Est. {model.cost}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#3D524010', borderRadius: '6px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        <strong>Formula:</strong> FLOPs = 6 x {paramsBillions}B params x {tokensBillions >= 1000 ? `${(tokensBillions / 1000).toFixed(1)}T` : `${tokensBillions}B`} tokens = {formatFlops(calc.flops)} FLOPs. At {(utilization * 100).toFixed(0)}% MFU on {gpu.name}, this costs ~{formatCost(calc.totalCost)} in cloud compute.
      </div>
    </div>
  );
}
