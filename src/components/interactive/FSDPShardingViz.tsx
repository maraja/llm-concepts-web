import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function FSDPShardingViz() {
  const [numGPUs, setNumGPUs] = useState(4);
  const [modelSizeB, setModelSizeB] = useState(7);
  const [step, setStep] = useState(0);

  const gpuColors = ['#C76B4A', '#D4A843', '#8BA888', '#5B8DB8', '#9B7DB8', '#D48A9B', '#6BAAAA', '#B8965B'];

  const data = useMemo(() => {
    const params = modelSizeB * 1e9;
    const bytesPerFP16 = 2;
    const bytesPerFP32 = 4;

    // Full model memory (FP16 params only, for simplicity of visualization)
    const fullParamsMem = (params * bytesPerFP16) / 1e9;
    const fullGradientsMem = (params * bytesPerFP16) / 1e9;
    const fullOptimizerMem = (params * bytesPerFP32 * 3) / 1e9; // momentum + variance + master

    const shardParamsMem = fullParamsMem / numGPUs;
    const shardGradientsMem = fullGradientsMem / numGPUs;
    const shardOptimizerMem = fullOptimizerMem / numGPUs;

    // Memory at each step:
    // Step 0: Sharded state - each GPU holds 1/N of params, grads, optimizer
    // Step 1: All-gather before forward - each GPU temporarily holds full params
    // Step 2: Forward compute - full params + activations in memory
    // Step 3: Reduce-scatter after backward - gradients reduced and sharded
    // Step 4: Discard - back to sharded state, optimizer update

    const steps = [
      {
        label: 'Sharded State',
        description: `Each GPU holds only 1/${numGPUs} of parameters, gradients, and optimizer states.`,
        perGPU: shardParamsMem + shardGradientsMem + shardOptimizerMem,
        breakdown: { params: shardParamsMem, gradients: shardGradientsMem, optimizer: shardOptimizerMem, tempParams: 0 },
      },
      {
        label: 'All-Gather (Before Forward)',
        description: `All-gather reconstructs full parameters on each GPU. Memory temporarily spikes.`,
        perGPU: fullParamsMem + shardGradientsMem + shardOptimizerMem,
        breakdown: { params: shardParamsMem, gradients: shardGradientsMem, optimizer: shardOptimizerMem, tempParams: fullParamsMem - shardParamsMem },
      },
      {
        label: 'Forward Compute',
        description: 'Forward pass executes with full parameters available. Activations are stored for backward.',
        perGPU: fullParamsMem + shardGradientsMem + shardOptimizerMem,
        breakdown: { params: shardParamsMem, gradients: shardGradientsMem, optimizer: shardOptimizerMem, tempParams: fullParamsMem - shardParamsMem },
      },
      {
        label: 'Reduce-Scatter (After Backward)',
        description: 'Gradients are reduced and scattered. Each GPU gets its 1/N shard of the reduced gradients.',
        perGPU: fullParamsMem + shardGradientsMem + shardOptimizerMem,
        breakdown: { params: shardParamsMem, gradients: shardGradientsMem, optimizer: shardOptimizerMem, tempParams: fullParamsMem - shardParamsMem },
      },
      {
        label: 'Discard + Optimizer Step',
        description: `Non-local parameters discarded. Optimizer updates only the local 1/${numGPUs} shard.`,
        perGPU: shardParamsMem + shardGradientsMem + shardOptimizerMem,
        breakdown: { params: shardParamsMem, gradients: shardGradientsMem, optimizer: shardOptimizerMem, tempParams: 0 },
      },
    ];

    const peakMem = Math.max(...steps.map(s => s.perGPU));
    const steadyStateMem = steps[0].perGPU;

    // Communication volume per step
    const allGatherVol = fullParamsMem * ((numGPUs - 1) / numGPUs); // each GPU receives (N-1)/N of full params
    const reduceScatterVol = fullGradientsMem * ((numGPUs - 1) / numGPUs);

    return { steps, peakMem, steadyStateMem, allGatherVol, reduceScatterVol, fullParamsMem, shardParamsMem };
  }, [numGPUs, modelSizeB]);

  const currentStep = data.steps[step];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          FSDP Sharding Visualization
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Step through the FSDP lifecycle: sharded state, all-gather before forward, compute, reduce-scatter after backward, and discard.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Number of GPUs</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numGPUs}</span>
          </div>
          <input type="range" min={2} max={16} step={1} value={numGPUs}
            onChange={e => setNumGPUs(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Model Size</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{modelSizeB}B</span>
          </div>
          <input type="range" min={1} max={70} step={1} value={modelSizeB}
            onChange={e => setModelSizeB(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Step</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{step + 1}/5</span>
          </div>
          <input type="range" min={0} max={4} step={1} value={step}
            onChange={e => setStep(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
        {data.steps.map((s, i) => (
          <div key={i} style={{
            flex: 1, height: '6px', borderRadius: '3px',
            background: i === step ? '#C76B4A' : i < step ? '#8BA888' : '#E5DFD3',
            transition: 'background 0.2s ease',
            cursor: 'pointer',
          }}
            onClick={() => setStep(i)}
          />
        ))}
      </div>

      {/* Current step description */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', fontWeight: 600, marginBottom: '0.25rem' }}>
          STEP {step + 1}: {currentStep.label.toUpperCase()}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.5 }}>
          {currentStep.description}
        </div>
      </div>

      {/* GPU shard visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem', fontWeight: 600 }}>
          GPU MEMORY STATE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numGPUs, 8)}, 1fr)`, gap: '0.5rem' }}>
          {Array.from({ length: Math.min(numGPUs, 8) }, (_, i) => {
            const hasFullParams = step === 1 || step === 2 || step === 3;
            const color = gpuColors[i % gpuColors.length];
            return (
              <div key={i} style={{
                background: '#FDFBF7', borderRadius: '8px', padding: '0.4rem',
                border: `1px solid ${color}33`,
              }}>
                <div style={{
                  fontSize: '0.55rem', fontWeight: 700, color: '#FDFBF7',
                  background: color, borderRadius: '4px',
                  padding: '0.1rem 0.2rem', marginBottom: '0.3rem',
                  textAlign: 'center',
                }}>
                  GPU {i}
                </div>
                {/* Parameter blocks */}
                <div style={{ marginBottom: '0.2rem' }}>
                  <div style={{ fontSize: '0.45rem', color: '#7A8B7C', marginBottom: '0.1rem' }}>params</div>
                  <div style={{ display: 'flex', gap: '1px' }}>
                    {Array.from({ length: numGPUs }, (_, j) => (
                      <div key={j} style={{
                        flex: 1, height: '8px',
                        background: j === i ? color : (hasFullParams ? gpuColors[j % gpuColors.length] : '#E5DFD3'),
                        borderRadius: '1px',
                        opacity: j === i ? 0.9 : (hasFullParams ? 0.4 : 0.2),
                        transition: 'all 0.3s ease',
                      }} />
                    ))}
                  </div>
                </div>
                {/* Optimizer block (always sharded) */}
                <div style={{ marginBottom: '0.2rem' }}>
                  <div style={{ fontSize: '0.45rem', color: '#7A8B7C', marginBottom: '0.1rem' }}>optim</div>
                  <div style={{ display: 'flex', gap: '1px' }}>
                    {Array.from({ length: numGPUs }, (_, j) => (
                      <div key={j} style={{
                        flex: 1, height: '6px',
                        background: j === i ? '#8BA888' : '#E5DFD3',
                        borderRadius: '1px',
                        opacity: j === i ? 0.8 : 0.2,
                      }} />
                    ))}
                  </div>
                </div>
                {/* Gradient block */}
                <div>
                  <div style={{ fontSize: '0.45rem', color: '#7A8B7C', marginBottom: '0.1rem' }}>grads</div>
                  <div style={{ display: 'flex', gap: '1px' }}>
                    {Array.from({ length: numGPUs }, (_, j) => (
                      <div key={j} style={{
                        flex: 1, height: '6px',
                        background: j === i ? '#D4A843' : '#E5DFD3',
                        borderRadius: '1px',
                        opacity: j === i ? 0.8 : 0.2,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {numGPUs > 8 && (
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C', marginTop: '0.3rem', textAlign: 'center' }}>
            Showing 8 of {numGPUs} GPUs
          </div>
        )}
        {/* Legend for shard viz */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#C76B4A', opacity: 0.9 }} />
            <span style={{ fontSize: '0.52rem', color: '#7A8B7C' }}>Owned shard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#C76B4A', opacity: 0.4 }} />
            <span style={{ fontSize: '0.52rem', color: '#7A8B7C' }}>Gathered (temp)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#E5DFD3' }} />
            <span style={{ fontSize: '0.52rem', color: '#7A8B7C' }}>Not present</span>
          </div>
        </div>
      </div>

      {/* Memory timeline */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          PER-GPU MEMORY AT EACH STEP
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px', marginBottom: '0.3rem' }}>
          {data.steps.map((s, i) => {
            const heightPct = data.peakMem > 0 ? (s.perGPU / data.peakMem) * 100 : 0;
            const isCurrent = i === step;
            return (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                height: '100%', cursor: 'pointer',
              }} onClick={() => setStep(i)}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.48rem', color: isCurrent ? '#C76B4A' : '#7A8B7C',
                  fontWeight: isCurrent ? 700 : 400, marginBottom: '0.15rem',
                }}>
                  {s.perGPU.toFixed(1)}G
                </div>
                <div style={{
                  width: '80%',
                  height: `${heightPct}%`,
                  background: isCurrent ? '#C76B4A' : (s.breakdown.tempParams > 0 ? '#D4A843' : '#8BA888'),
                  borderRadius: '3px 3px 0 0',
                  transition: 'all 0.3s ease',
                  opacity: isCurrent ? 1 : 0.6,
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {data.steps.map((s, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center',
              fontSize: '0.42rem', color: i === step ? '#C76B4A' : '#7A8B7C',
              fontWeight: i === step ? 600 : 400,
            }}>
              {s.label.split(' ')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Steady State</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {data.steadyStateMem.toFixed(1)} GB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Peak Memory</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {data.peakMem.toFixed(1)} GB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>All-Gather</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {data.allGatherVol.toFixed(1)} GB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Reduce-Scatter</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#5B8DB8' }}>
            {data.reduceScatterVol.toFixed(1)} GB
          </div>
        </div>
      </div>

      {/* Communication cost comparison */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>
          FSDP Communication per Training Step
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.62rem', color: '#5A6B5C' }}>
            <span style={{ fontWeight: 600, color: '#D4A843' }}>All-gather</span>: {data.allGatherVol.toFixed(1)} GB (before fwd)
          </span>
          <span style={{ fontSize: '0.62rem', color: '#5A6B5C' }}>
            <span style={{ fontWeight: 600, color: '#5B8DB8' }}>Reduce-scatter</span>: {data.reduceScatterVol.toFixed(1)} GB (after bwd)
          </span>
          <span style={{ fontSize: '0.62rem', color: '#5A6B5C' }}>
            <span style={{ fontWeight: 600, color: '#C76B4A' }}>Total</span>: {(data.allGatherVol + data.reduceScatterVol).toFixed(1)} GB/step
          </span>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {step === 0 || step === 4
            ? `In steady state, each GPU holds only 1/${numGPUs} of the ${modelSizeB}B model (${data.shardParamsMem.toFixed(1)} GB of params). FSDP reconstructs the full parameters on-demand via all-gather before each FSDP unit's forward pass, then discards them. This keeps steady-state memory at ${data.steadyStateMem.toFixed(1)} GB -- a ${numGPUs}x reduction from storing the full model.`
            : step === 1 || step === 2
              ? `During forward/backward, each GPU temporarily holds full parameters (${data.fullParamsMem.toFixed(1)} GB), spiking memory to ${data.peakMem.toFixed(1)} GB. In practice, FSDP all-gathers one layer at a time (not the entire model), so the peak is much lower. Prefetching the next layer's all-gather overlaps communication with computation.`
              : `The reduce-scatter operation combines gradients across GPUs and distributes shards. Each GPU ends up with 1/${numGPUs} of the reduced gradients, needing ${data.reduceScatterVol.toFixed(1)} GB of communication. This is equivalent to an all-reduce split into two phases, enabling overlap with backward computation.`}
        </div>
      </div>
    </div>
  );
}
