import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function GradientAccumulationCalc() {
  const [microBatchSize, setMicroBatchSize] = useState(4);
  const [accumSteps, setAccumSteps] = useState(8);
  const [gpuCount, setGpuCount] = useState(1);
  const [seqLength, setSeqLength] = useState(2048);

  const metrics = useMemo(() => {
    const effectiveBatch = microBatchSize * accumSteps * gpuCount;

    // Memory estimate (rough): base model + activations proportional to micro-batch
    // Assume a 7B model as reference
    const baseMemoryGB = 14; // model weights + optimizer states
    const activationMemPerSample = (seqLength / 2048) * 2.5; // GB, scales with sequence length
    const microBatchMemory = baseMemoryGB + microBatchSize * activationMemPerSample;
    const fullBatchMemory = baseMemoryGB + effectiveBatch * activationMemPerSample;

    // Tokens per step
    const tokensPerStep = effectiveBatch * seqLength;
    const tokensPerMicroBatch = microBatchSize * seqLength;

    // Throughput: accumulation adds overhead (multiple forward/backward passes per optimizer step)
    const forwardBackwardTime = microBatchSize * 0.1; // arbitrary units
    const optimizerStepTime = 0.05;
    const timePerStep = accumSteps * forwardBackwardTime * gpuCount + optimizerStepTime;
    const throughput = tokensPerStep / timePerStep;

    // Compare: what if we could fit the full batch in memory
    const fullBatchTime = effectiveBatch * 0.1 + optimizerStepTime;
    const fullBatchThroughput = tokensPerStep / fullBatchTime;

    return {
      effectiveBatch,
      microBatchMemory,
      fullBatchMemory,
      memorySaved: fullBatchMemory - microBatchMemory,
      tokensPerStep,
      tokensPerMicroBatch,
      throughput,
      fullBatchThroughput,
      throughputRatio: throughput / fullBatchThroughput,
    };
  }, [microBatchSize, accumSteps, gpuCount, seqLength]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Gradient Accumulation Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Simulate large batch sizes without the memory cost. Gradients are accumulated over multiple micro-batches before updating weights.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Micro-Batch Size', value: microBatchSize, set: setMicroBatchSize, min: 1, max: 32, step: 1, fmt: (v: number) => String(v) },
          { label: 'Accumulation Steps', value: accumSteps, set: setAccumSteps, min: 1, max: 64, step: 1, fmt: (v: number) => String(v) },
          { label: 'GPU Count', value: gpuCount, set: setGpuCount, min: 1, max: 64, step: 1, fmt: (v: number) => String(v) },
          { label: 'Sequence Length', value: seqLength, set: setSeqLength, min: 512, max: 8192, step: 512, fmt: (v: number) => `${(v / 1000).toFixed(1)}K` },
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

      {/* Effective batch size formula */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Effective batch size calculation
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>{microBatchSize}</div>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>micro-batch</div>
          </div>
          <span style={{ fontSize: '1.2rem', color: '#7A8B7C' }}>{'\u00D7'}</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#D4A843' }}>{accumSteps}</div>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>accum steps</div>
          </div>
          <span style={{ fontSize: '1.2rem', color: '#7A8B7C' }}>{'\u00D7'}</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#8BA888' }}>{gpuCount}</div>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>GPUs</div>
          </div>
          <span style={{ fontSize: '1.2rem', color: '#7A8B7C' }}>=</span>
          <div style={{ textAlign: 'center', padding: '0.3rem 0.6rem', background: 'rgba(199, 107, 74, 0.1)', borderRadius: '6px' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 700, color: '#C76B4A' }}>{metrics.effectiveBatch}</div>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>effective batch</div>
          </div>
        </div>
      </div>

      {/* Accumulation steps visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Accumulation cycle ({accumSteps} micro-batches before weight update)
        </div>
        <div style={{ display: 'flex', gap: '2px', height: '28px', marginBottom: '0.3rem' }}>
          {Array.from({ length: Math.min(accumSteps, 32) }, (_, i) => (
            <div key={i} style={{
              flex: 1,
              background: i < accumSteps - 1 ? '#D4A843' : '#C76B4A',
              borderRadius: '3px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.5rem', color: '#FDFBF7', fontWeight: 600,
              minWidth: '4px',
              transition: 'all 0.2s ease',
            }}>
              {accumSteps <= 16 ? (i < accumSteps - 1 ? 'fwd/bwd' : 'update') : ''}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#7A8B7C' }}>
          <span>Accumulate gradients...</span>
          <span>...then optimizer step</span>
        </div>
      </div>

      {/* Memory comparison */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          GPU memory comparison (7B model)
        </div>
        {[
          { label: `With accumulation (micro-batch=${microBatchSize})`, value: metrics.microBatchMemory, color: '#8BA888' },
          { label: `Without accumulation (full batch=${metrics.effectiveBatch})`, value: metrics.fullBatchMemory, color: '#C76B4A' },
        ].map(item => {
          const maxMem = metrics.fullBatchMemory;
          const barW = (item.value / maxMem) * 100;
          return (
            <div key={item.label} style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#2C3E2D' }}>{item.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: item.color, fontWeight: 600 }}>{item.value.toFixed(1)} GB</span>
              </div>
              <div style={{ height: '14px', background: 'rgba(229, 223, 211, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(barW, 100)}%`, height: '100%',
                  background: item.color, borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: '0.62rem', color: '#8BA888', fontWeight: 600, marginTop: '0.3rem' }}>
          Memory saved: {metrics.memorySaved.toFixed(1)} GB ({((metrics.memorySaved / metrics.fullBatchMemory) * 100).toFixed(0)}%)
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Tokens / Step</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {metrics.tokensPerStep >= 1e6 ? `${(metrics.tokensPerStep / 1e6).toFixed(1)}M` : `${(metrics.tokensPerStep / 1e3).toFixed(0)}K`}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Throughput</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {(metrics.throughputRatio * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>vs full batch</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Per GPU Memory</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {metrics.microBatchMemory.toFixed(1)} GB
          </div>
        </div>
      </div>

      {/* Common configurations */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>Common LLM Batch Sizes</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { name: 'GPT-3', batch: 3200000, tokens: '3.2M tokens' },
            { name: 'LLaMA', batch: 4000000, tokens: '4M tokens' },
            { name: 'Chinchilla', batch: 1500000, tokens: '1.5M tokens' },
          ].map(m => (
            <span key={m.name} style={{ fontSize: '0.62rem', color: '#5A6B5C' }}>
              <span style={{ fontWeight: 600 }}>{m.name}</span>: {m.tokens}/step
            </span>
          ))}
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {accumSteps === 1 && gpuCount === 1
            ? 'No gradient accumulation -- each micro-batch triggers a weight update. To simulate larger batches, increase accumulation steps. This trades compute time for memory.'
            : `Gradient accumulation lets you train with an effective batch size of ${metrics.effectiveBatch} while only fitting ${microBatchSize} samples in memory per GPU. The gradients from ${accumSteps} forward/backward passes are summed before the optimizer step, producing mathematically identical updates to a full batch of ${metrics.effectiveBatch}.`}
        </div>
      </div>
    </div>
  );
}
