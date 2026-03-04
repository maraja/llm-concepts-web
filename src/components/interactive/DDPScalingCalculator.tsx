import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function DDPScalingCalculator() {
  const [numGPUs, setNumGPUs] = useState(8);
  const [batchPerGPU, setBatchPerGPU] = useState(8);
  const [modelSizeB, setModelSizeB] = useState(7);
  const [interconnect, setInterconnect] = useState<'pcie' | 'nvlink' | 'infiniband'>('nvlink');

  const interconnectBW: Record<string, { name: string; bwGBps: number; latencyUs: number }> = {
    pcie: { name: 'PCIe 4.0 x16', bwGBps: 32, latencyUs: 5 },
    nvlink: { name: 'NVLink 3.0', bwGBps: 300, latencyUs: 1 },
    infiniband: { name: 'InfiniBand HDR', bwGBps: 25, latencyUs: 1.5 },
  };

  const calc = useMemo(() => {
    const params = modelSizeB * 1e9;
    const gradientSizeBytes = params * 4; // FP32 gradients
    const gradientSizeGB = gradientSizeBytes / 1e9;

    const ic = interconnectBW[interconnect];

    // Ring all-reduce: 2*(N-1)/N * gradientSize
    const allReduceVolume = 2 * ((numGPUs - 1) / numGPUs) * gradientSizeGB;
    const allReduceTime = allReduceVolume / ic.bwGBps + (ic.latencyUs * 2 * (numGPUs - 1)) / 1e6;

    // Compute time per GPU (rough: proportional to batch and model size)
    const seqLen = 2048;
    const flopsPerToken = 6 * params; // approximate FLOPs per token (forward + backward)
    const tokensPerGPU = batchPerGPU * seqLen;
    const gpuTFLOPS = 150; // assume A100-class GPU
    const computeTime = (flopsPerToken * tokensPerGPU) / (gpuTFLOPS * 1e12);

    // Total step time
    const stepTime = computeTime + allReduceTime;
    const effectiveBatch = batchPerGPU * numGPUs;
    const totalTokens = effectiveBatch * seqLen;
    const throughput = totalTokens / stepTime;

    // Ideal linear scaling
    const singleGPUTime = computeTime; // no communication
    const singleGPUTokens = batchPerGPU * seqLen;
    const singleGPUThroughput = singleGPUTokens / singleGPUTime;
    const idealThroughput = singleGPUThroughput * numGPUs;
    const scalingEfficiency = throughput / idealThroughput * 100;

    const commOverhead = (allReduceTime / stepTime) * 100;

    // Scaling curve for chart
    const scalingCurve = Array.from({ length: 8 }, (_, idx) => {
      const n = Math.pow(2, idx + 1); // 2, 4, 8, 16, 32, 64, 128, 256
      if (n > 256) return null;
      const arVol = 2 * ((n - 1) / n) * gradientSizeGB;
      const arTime = arVol / ic.bwGBps + (ic.latencyUs * 2 * (n - 1)) / 1e6;
      const sTime = computeTime + arTime;
      const sToks = batchPerGPU * n * seqLen;
      const sThroughput = sToks / sTime;
      const idealT = singleGPUThroughput * n;
      return { n, efficiency: (sThroughput / idealT * 100), throughput: sThroughput };
    }).filter(Boolean) as { n: number; efficiency: number; throughput: number }[];

    return {
      effectiveBatch,
      throughput,
      idealThroughput,
      scalingEfficiency,
      commOverhead,
      allReduceTime,
      computeTime,
      stepTime,
      gradientSizeGB,
      allReduceVolume,
      totalTokens,
      scalingCurve,
    };
  }, [numGPUs, batchPerGPU, modelSizeB, interconnect]);

  const formatNum = (n: number) => {
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
    return n.toFixed(0);
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          DDP Scaling Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Calculate scaling efficiency with Distributed Data Parallel. See how interconnect speed, model size, and GPU count affect throughput.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Number of GPUs', value: numGPUs, set: setNumGPUs, min: 2, max: 128, step: 2, fmt: (v: number) => String(v) },
          { label: 'Batch Size / GPU', value: batchPerGPU, set: setBatchPerGPU, min: 1, max: 64, step: 1, fmt: (v: number) => String(v) },
          { label: 'Model Size', value: modelSizeB, set: setModelSizeB, min: 1, max: 70, step: 1, fmt: (v: number) => `${v}B` },
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

      {/* Interconnect selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D', marginBottom: '0.4rem' }}>Interconnect</div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['pcie', 'nvlink', 'infiniband'] as const).map(ic => (
            <button key={ic} onClick={() => setInterconnect(ic)} style={{
              padding: '0.35rem 0.7rem', borderRadius: '5px',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
              border: `1px solid ${interconnect === ic ? '#C76B4A' : '#E5DFD3'}`,
              background: interconnect === ic ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
              color: interconnect === ic ? '#C76B4A' : '#5A6B5C',
              fontWeight: interconnect === ic ? 600 : 400,
              cursor: 'pointer',
            }}>
              {interconnectBW[ic].name}
              <span style={{ display: 'block', fontSize: '0.55rem', color: '#7A8B7C', fontWeight: 400 }}>
                {interconnectBW[ic].bwGBps} GB/s
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Time breakdown */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          STEP TIME BREAKDOWN
        </div>
        {[
          { label: 'Compute', value: calc.computeTime, color: '#8BA888' },
          { label: 'All-Reduce', value: calc.allReduceTime, color: '#C76B4A' },
        ].map(item => {
          const pct = (item.value / calc.stepTime) * 100;
          return (
            <div key={item.label} style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#2C3E2D' }}>{item.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: item.color, fontWeight: 600 }}>
                  {(item.value * 1000).toFixed(1)}ms ({pct.toFixed(1)}%)
                </span>
              </div>
              <div style={{ height: '14px', background: 'rgba(229, 223, 211, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(pct, 100)}%`, height: '100%',
                  background: item.color, borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scaling efficiency curve */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          SCALING EFFICIENCY CURVE
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100px' }}>
          {calc.scalingCurve.map(point => {
            const isCurrentN = point.n === numGPUs || (numGPUs > 128 && point.n === 256);
            return (
              <div key={point.n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Ideal bar */}
                <div style={{ width: '100%', display: 'flex', gap: '1px', justifyContent: 'center' }}>
                  <div style={{
                    width: '40%', height: '100px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  }}>
                    <div style={{
                      height: `${100}%`,
                      background: '#E5DFD3', borderRadius: '2px 2px 0 0',
                      opacity: 0.6,
                    }} />
                  </div>
                  <div style={{
                    width: '40%', height: '100px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  }}>
                    <div style={{
                      height: `${point.efficiency}%`,
                      background: isCurrentN ? '#C76B4A' : '#8BA888',
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.3s ease',
                    }} />
                  </div>
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.5rem', color: isCurrentN ? '#C76B4A' : '#7A8B7C',
                  fontWeight: isCurrentN ? 700 : 400,
                  marginTop: '0.2rem',
                }}>
                  {point.n}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.45rem', color: '#7A8B7C',
                }}>
                  {point.efficiency.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          {[
            { label: 'Ideal (100%)', color: '#E5DFD3' },
            { label: 'Actual', color: '#8BA888' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
              <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Eff. Batch</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {calc.effectiveBatch}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Tokens/sec</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {formatNum(calc.throughput)}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Comm Overhead</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {calc.commOverhead.toFixed(1)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Scale Eff.</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {calc.scalingEfficiency.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {calc.commOverhead > 30
            ? `Communication dominates at ${calc.commOverhead.toFixed(0)}% of step time. The ${interconnectBW[interconnect].name} interconnect is the bottleneck for a ${modelSizeB}B model across ${numGPUs} GPUs. Consider using a faster interconnect or increasing batch size per GPU to improve the compute-to-communication ratio.`
            : `DDP achieves ${calc.scalingEfficiency.toFixed(0)}% scaling efficiency with ${numGPUs} GPUs on ${interconnectBW[interconnect].name}. The all-reduce communication (${calc.commOverhead.toFixed(1)}% overhead) is well-hidden behind computation. Larger models and batch sizes improve this ratio further.`}
        </div>
      </div>
    </div>
  );
}
