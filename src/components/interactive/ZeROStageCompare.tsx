import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function ZeROStageCompare() {
  const [modelParamsB, setModelParamsB] = useState(7);
  const [numGPUs, setNumGPUs] = useState(8);

  const calc = useMemo(() => {
    const params = modelParamsB * 1e9;
    const bytesPerFP16 = 2;
    const bytesPerFP32 = 4;

    // Memory components (in GB):
    // Parameters (FP16): params * 2 bytes
    const paramsMem = (params * bytesPerFP16) / 1e9;
    // Gradients (FP16): params * 2 bytes
    const gradientsMem = (params * bytesPerFP16) / 1e9;
    // Optimizer states (Adam FP32): momentum + variance = params * 4 * 2 + master weights params * 4
    const optimizerMem = (params * bytesPerFP32 * 3) / 1e9; // 12 bytes per param (momentum + variance + master)

    // DDP: everything replicated on every GPU
    const ddp = {
      params: paramsMem,
      gradients: gradientsMem,
      optimizer: optimizerMem,
      total: paramsMem + gradientsMem + optimizerMem,
      label: 'DDP (No ZeRO)',
    };

    // ZeRO Stage 1: Shard optimizer states
    const zero1 = {
      params: paramsMem,
      gradients: gradientsMem,
      optimizer: optimizerMem / numGPUs,
      total: paramsMem + gradientsMem + optimizerMem / numGPUs,
      label: 'ZeRO Stage 1',
    };

    // ZeRO Stage 2: Shard optimizer states + gradients
    const zero2 = {
      params: paramsMem,
      gradients: gradientsMem / numGPUs,
      optimizer: optimizerMem / numGPUs,
      total: paramsMem + gradientsMem / numGPUs + optimizerMem / numGPUs,
      label: 'ZeRO Stage 2',
    };

    // ZeRO Stage 3: Shard everything
    const zero3 = {
      params: paramsMem / numGPUs,
      gradients: gradientsMem / numGPUs,
      optimizer: optimizerMem / numGPUs,
      total: (paramsMem + gradientsMem + optimizerMem) / numGPUs,
      label: 'ZeRO Stage 3',
    };

    const maxMem = ddp.total;

    // Typical GPU memory capacities
    const gpuMemOptions = [
      { name: 'A100 40GB', mem: 40 },
      { name: 'A100 80GB', mem: 80 },
      { name: 'H100 80GB', mem: 80 },
    ];

    return { ddp, zero1, zero2, zero3, maxMem, paramsMem, gradientsMem, optimizerMem, gpuMemOptions };
  }, [modelParamsB, numGPUs]);

  const stages = [calc.ddp, calc.zero1, calc.zero2, calc.zero3];

  const segmentColors = {
    params: '#C76B4A',
    gradients: '#D4A843',
    optimizer: '#8BA888',
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          ZeRO Stage Comparison
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare per-GPU memory across ZeRO Stages 1, 2, and 3. See how each stage progressively shards more training state.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Model Parameters</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{modelParamsB}B</span>
          </div>
          <input type="range" min={1} max={70} step={1} value={modelParamsB}
            onChange={e => setModelParamsB(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Number of GPUs</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numGPUs}</span>
          </div>
          <input type="range" min={2} max={64} step={2} value={numGPUs}
            onChange={e => setNumGPUs(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* What each stage shards */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          WHAT GETS SHARDED
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
          {/* Header row */}
          {['', 'Optimizer', 'Gradients', 'Params'].map(h => (
            <div key={h} style={{ fontSize: '0.58rem', fontWeight: 600, color: '#7A8B7C', textAlign: 'center', padding: '0.2rem' }}>
              {h}
            </div>
          ))}
          {/* Stage rows */}
          {[
            { label: 'DDP', optimizer: false, gradients: false, params: false },
            { label: 'ZeRO-1', optimizer: true, gradients: false, params: false },
            { label: 'ZeRO-2', optimizer: true, gradients: true, params: false },
            { label: 'ZeRO-3', optimizer: true, gradients: true, params: true },
          ].map(row => (
            [
              <div key={`${row.label}-label`} style={{ fontSize: '0.62rem', fontWeight: 600, color: '#2C3E2D', padding: '0.3rem' }}>
                {row.label}
              </div>,
              <div key={`${row.label}-opt`} style={{ textAlign: 'center', padding: '0.3rem' }}>
                <span style={{
                  display: 'inline-block', width: '16px', height: '16px', borderRadius: '4px',
                  background: row.optimizer ? '#8BA888' : '#E5DFD3',
                  color: row.optimizer ? '#FDFBF7' : '#B0A898',
                  fontSize: '0.55rem', lineHeight: '16px', fontWeight: 700,
                }}>
                  {row.optimizer ? '\u2713' : '\u2717'}
                </span>
              </div>,
              <div key={`${row.label}-grad`} style={{ textAlign: 'center', padding: '0.3rem' }}>
                <span style={{
                  display: 'inline-block', width: '16px', height: '16px', borderRadius: '4px',
                  background: row.gradients ? '#D4A843' : '#E5DFD3',
                  color: row.gradients ? '#FDFBF7' : '#B0A898',
                  fontSize: '0.55rem', lineHeight: '16px', fontWeight: 700,
                }}>
                  {row.gradients ? '\u2713' : '\u2717'}
                </span>
              </div>,
              <div key={`${row.label}-params`} style={{ textAlign: 'center', padding: '0.3rem' }}>
                <span style={{
                  display: 'inline-block', width: '16px', height: '16px', borderRadius: '4px',
                  background: row.params ? '#C76B4A' : '#E5DFD3',
                  color: row.params ? '#FDFBF7' : '#B0A898',
                  fontSize: '0.55rem', lineHeight: '16px', fontWeight: 700,
                }}>
                  {row.params ? '\u2713' : '\u2717'}
                </span>
              </div>,
            ]
          )).flat()}
        </div>
      </div>

      {/* Stacked bar chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem', fontWeight: 600 }}>
          PER-GPU MEMORY (GB)
        </div>
        {stages.map((stage, idx) => (
          <div key={stage.label} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{stage.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#C76B4A', fontWeight: 600 }}>
                {stage.total.toFixed(1)} GB
              </span>
            </div>
            <div style={{ display: 'flex', height: '28px', borderRadius: '4px', overflow: 'hidden' }}>
              {[
                { value: stage.optimizer, color: segmentColors.optimizer, label: 'Optim' },
                { value: stage.gradients, color: segmentColors.gradients, label: 'Grads' },
                { value: stage.params, color: segmentColors.params, label: 'Params' },
              ].map(seg => {
                const pct = calc.maxMem > 0 ? (seg.value / calc.maxMem) * 100 : 0;
                return (
                  <div key={seg.label} style={{
                    width: `${pct}%`,
                    background: seg.color,
                    transition: 'width 0.3s ease',
                    minWidth: seg.value > 0 ? '2px' : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {pct > 8 && (
                      <span style={{ fontSize: '0.48rem', color: '#FDFBF7', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {seg.label} {seg.value.toFixed(1)}G
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* GPU memory fit indicator */}
            {calc.gpuMemOptions.map(gpu => {
              const fits = stage.total <= gpu.mem;
              return null; // We'll show this in a separate section
            })}
          </div>
        ))}
        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          {[
            { label: 'Optimizer States', color: segmentColors.optimizer },
            { label: 'Gradients', color: segmentColors.gradients },
            { label: 'Parameters', color: segmentColors.params },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
              <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Memory reduction vs DDP */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          MEMORY REDUCTION VS DDP
        </div>
        {[calc.zero1, calc.zero2, calc.zero3].map((stage) => {
          const reduction = ((1 - stage.total / calc.ddp.total) * 100);
          return (
            <div key={stage.label} style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#2C3E2D' }}>{stage.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#8BA888', fontWeight: 600 }}>
                  -{reduction.toFixed(0)}% ({stage.total.toFixed(1)} GB vs {calc.ddp.total.toFixed(1)} GB)
                </span>
              </div>
              <div style={{ height: '14px', background: 'rgba(229, 223, 211, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${reduction}%`, height: '100%',
                  background: '#8BA888', borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* GPU fit check */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>
          Fits on GPU? (excluding activations)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem' }}>
          {stages.map(stage => (
            <div key={stage.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', fontWeight: 600, color: '#2C3E2D', marginBottom: '0.2rem' }}>{stage.label}</div>
              {calc.gpuMemOptions.slice(0, 2).map(gpu => (
                <div key={gpu.name} style={{
                  fontSize: '0.5rem',
                  color: stage.total <= gpu.mem ? '#8BA888' : '#C76B4A',
                  fontWeight: 600,
                }}>
                  {gpu.name}: {stage.total <= gpu.mem ? '\u2713' : '\u2717'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>DDP Memory</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {calc.ddp.total.toFixed(1)} GB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>ZeRO-3 Memory</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {calc.zero3.total.toFixed(1)} GB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Reduction</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {((1 - calc.zero3.total / calc.ddp.total) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {`For a ${modelParamsB}B model across ${numGPUs} GPUs: DDP requires ${calc.ddp.total.toFixed(1)} GB/GPU. ZeRO Stage 1 shards optimizer states, reducing to ${calc.zero1.total.toFixed(1)} GB. Stage 2 also shards gradients (${calc.zero2.total.toFixed(1)} GB). Stage 3 shards everything -- parameters, gradients, and optimizer states -- bringing per-GPU memory to just ${calc.zero3.total.toFixed(1)} GB. The trade-off: Stage 3 requires all-gather communication before each forward/backward pass to reconstruct full parameters.`}
        </div>
      </div>
    </div>
  );
}
