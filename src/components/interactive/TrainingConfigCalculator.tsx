import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const KNOWN_CONFIGS = [
  { name: 'LLaMA 2 7B', params: 7, tp: 1, pp: 1, dp: 8, gpus: 8, gpuMem: 80, layers: 32, hidden: 4096 },
  { name: 'LLaMA 2 70B', params: 70, tp: 8, pp: 2, dp: 8, gpus: 128, gpuMem: 80, layers: 80, hidden: 8192 },
  { name: 'GPT-3 175B', params: 175, tp: 8, pp: 8, dp: 8, gpus: 512, gpuMem: 40, layers: 96, hidden: 12288 },
  { name: 'LLaMA 3 405B', params: 405, tp: 8, pp: 16, dp: 128, gpus: 16384, gpuMem: 80, layers: 126, hidden: 16384 },
  { name: 'Mixtral 8x22B', params: 141, tp: 8, pp: 4, dp: 8, gpus: 256, gpuMem: 80, layers: 56, hidden: 6144 },
];

export default function TrainingConfigCalculator() {
  const [modelSize, setModelSize] = useState(70);
  const [gpuMemory, setGpuMemory] = useState(80);
  const [totalGPUs, setTotalGPUs] = useState(128);

  const config = useMemo(() => {
    // Memory per parameter: 2 bytes (FP16 weights) + 12 bytes (Adam: FP32 copy + FP32 m + FP32 v) + 2 bytes (FP16 gradients) = 16 bytes
    const bytesPerParam = 16;
    const totalModelMemGB = (modelSize * 1e9 * bytesPerParam) / 1e9;

    // Estimate layers and hidden dim from model size
    const estimatedLayers = Math.round(modelSize < 13 ? 32 : modelSize < 40 ? 40 : modelSize < 100 ? 80 : modelSize < 200 ? 96 : 126);
    const estimatedHidden = Math.round(modelSize < 13 ? 4096 : modelSize < 40 ? 5120 : modelSize < 100 ? 8192 : modelSize < 200 ? 12288 : 16384);

    // Auto-suggest TP: fit model shard within GPU memory
    // Each GPU needs: model_params / (TP * PP) * bytesPerParam + activations
    let suggestedTP = 1;
    const usableGPUMem = gpuMemory * 0.85; // 85% usable

    // Try increasing TP until model shard fits
    for (let tp = 1; tp <= 8; tp *= 2) {
      const shardMem = totalModelMemGB / tp;
      if (shardMem <= usableGPUMem) {
        suggestedTP = tp;
        break;
      }
      suggestedTP = tp;
    }
    // If still doesn't fit with TP=8, we need PP
    let suggestedPP = 1;
    const memWithTP = totalModelMemGB / suggestedTP;
    if (memWithTP > usableGPUMem) {
      suggestedPP = Math.ceil(memWithTP / usableGPUMem);
      // Round up to power of 2 for efficiency
      suggestedPP = Math.pow(2, Math.ceil(Math.log2(suggestedPP)));
    }

    // DP fills remaining GPUs
    let suggestedDP = Math.floor(totalGPUs / (suggestedTP * suggestedPP));
    suggestedDP = Math.max(1, suggestedDP);

    const actualGPUs = suggestedTP * suggestedPP * suggestedDP;

    // Per-GPU memory breakdown
    const modelMemPerGPU = totalModelMemGB / (suggestedTP * suggestedPP);
    const modelWeightsPerGPU = (modelSize * 1e9 * 2) / 1e9 / (suggestedTP * suggestedPP); // FP16 weights
    const optimizerPerGPU = (modelSize * 1e9 * 12) / 1e9 / (suggestedTP * suggestedPP); // Adam states
    const gradientsPerGPU = (modelSize * 1e9 * 2) / 1e9 / (suggestedTP * suggestedPP); // FP16 gradients
    // Activation memory estimate (rough): proportional to hidden_dim^2 * layers / PP / TP
    const activationsPerGPU = (estimatedHidden * estimatedHidden * estimatedLayers * 4) / 1e9 / (suggestedTP * suggestedPP) * 0.5; // with checkpointing

    // Communication overhead estimate
    const tpOverhead = suggestedTP > 1 ? 15 : 0; // % per layer all-reduce
    const ppBubble = suggestedPP > 1 ? ((suggestedPP - 1) / suggestedPP) * 100 * 0.3 : 0; // pipeline bubble (with micro-batching)
    const dpOverhead = suggestedDP > 1 ? 5 : 0; // gradient all-reduce (overlapped)
    const totalOverhead = Math.min(tpOverhead + ppBubble + dpOverhead, 60);
    const effectiveUtil = 100 - totalOverhead;

    // Throughput estimate (tokens/sec/GPU)
    const baseTokensPerSecPerGPU = gpuMemory === 80 ? 3200 : 1600; // rough H100 vs A100
    const tokensPerSecTotal = baseTokensPerSecPerGPU * actualGPUs * (effectiveUtil / 100);

    return {
      totalModelMemGB,
      suggestedTP,
      suggestedPP,
      suggestedDP,
      actualGPUs,
      modelWeightsPerGPU,
      optimizerPerGPU,
      gradientsPerGPU,
      activationsPerGPU,
      modelMemPerGPU,
      totalMemPerGPU: modelWeightsPerGPU + optimizerPerGPU + gradientsPerGPU + activationsPerGPU,
      tpOverhead,
      ppBubble,
      dpOverhead,
      totalOverhead,
      effectiveUtil,
      tokensPerSecTotal,
      estimatedLayers,
      estimatedHidden,
      fitsInMemory: (modelWeightsPerGPU + optimizerPerGPU + gradientsPerGPU + activationsPerGPU) <= gpuMemory,
    };
  }, [modelSize, gpuMemory, totalGPUs]);

  const memBreakdown = [
    { label: 'FP16 Weights', value: config.modelWeightsPerGPU, color: '#5B8DB8' },
    { label: 'Optimizer (Adam)', value: config.optimizerPerGPU, color: '#C76B4A' },
    { label: 'Gradients', value: config.gradientsPerGPU, color: '#D4A843' },
    { label: 'Activations', value: config.activationsPerGPU, color: '#8BA888' },
  ];
  const maxMem = gpuMemory;

  const formatParams = (b: number) => {
    if (b >= 1000) return `${(b / 1000).toFixed(1)}T`;
    return `${b}B`;
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Training Configuration Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Configure model size and hardware, then see the auto-suggested parallelism strategy with per-GPU memory breakdown and throughput estimate.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Model Parameters</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{formatParams(modelSize)}</span>
          </div>
          <input type="range" min={7} max={1000} step={1} value={modelSize}
            onChange={e => setModelSize(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#7A8B7C' }}>
            <span>7B</span><span>1T</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>GPU Memory</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{gpuMemory} GB</span>
          </div>
          <input type="range" min={40} max={80} step={40} value={gpuMemory}
            onChange={e => setGpuMemory(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#7A8B7C' }}>
            <span>A100 40GB</span><span>A100/H100 80GB</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Total GPUs</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{totalGPUs}</span>
          </div>
          <input type="range" min={8} max={4096} step={8} value={totalGPUs}
            onChange={e => setTotalGPUs(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#7A8B7C' }}>
            <span>8</span><span>4,096</span>
          </div>
        </div>
      </div>

      {/* Suggested configuration */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>SUGGESTED PARALLELISM CONFIGURATION</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'TP', value: config.suggestedTP, color: '#5B8DB8', desc: 'tensor' },
            { label: 'PP', value: config.suggestedPP, color: '#D4A843', desc: 'pipeline' },
            { label: 'DP', value: config.suggestedDP, color: '#8BA888', desc: 'data' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', padding: '0.4rem 0.8rem', background: `${item.color}15`, borderRadius: '8px', border: `1px solid ${item.color}40` }}>
              <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase' }}>{item.desc}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>{item.label} degree</div>
            </div>
          ))}
          <div style={{ textAlign: 'center', padding: '0.4rem 0.8rem' }}>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>uses</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: config.actualGPUs > totalGPUs ? '#C76B4A' : '#2C3E2D' }}>
              {config.actualGPUs} / {totalGPUs}
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>GPUs</div>
          </div>
        </div>
      </div>

      {/* Memory breakdown per GPU */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#7A8B7C', fontWeight: 600 }}>PER-GPU MEMORY BREAKDOWN</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', fontWeight: 600,
            color: config.fitsInMemory ? '#8BA888' : '#C76B4A'
          }}>
            {config.totalMemPerGPU.toFixed(1)} / {gpuMemory} GB {config.fitsInMemory ? '(fits)' : '(OOM!)'}
          </span>
        </div>
        {/* Stacked bar */}
        <div style={{ height: '28px', background: '#E5DFD3', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '0.5rem' }}>
          {memBreakdown.map(item => {
            const pct = (item.value / maxMem) * 100;
            return (
              <div key={item.label} style={{
                width: `${pct}%`, height: '100%',
                background: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.45rem', color: '#FDFBF7', fontWeight: 600,
                transition: 'width 0.3s ease',
                minWidth: pct > 2 ? '1px' : '0',
              }}>
                {pct > 8 ? `${item.value.toFixed(1)}GB` : ''}
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {memBreakdown.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
              <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{item.label}: {item.value.toFixed(1)} GB</span>
            </div>
          ))}
        </div>
      </div>

      {/* Communication overhead */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>COMMUNICATION OVERHEAD</div>
        {[
          { label: `TP all-reduce (within ${config.suggestedTP} GPUs)`, value: config.tpOverhead, color: '#5B8DB8' },
          { label: `PP bubble (${config.suggestedPP} stages)`, value: config.ppBubble, color: '#D4A843' },
          { label: `DP gradient sync (${config.suggestedDP} replicas)`, value: config.dpOverhead, color: '#8BA888' },
        ].map(item => (
          <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 45px', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0' }}>
            <span style={{ fontSize: '0.65rem', color: '#2C3E2D' }}>{item.label}</span>
            <div style={{ height: '14px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: '3px', transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#7A8B7C', textAlign: 'right' }}>{item.value.toFixed(0)}%</span>
          </div>
        ))}
        <div style={{ marginTop: '0.3rem', fontSize: '0.62rem', color: '#5A6B5C' }}>
          Effective compute utilization: <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: config.effectiveUtil >= 70 ? '#8BA888' : '#C76B4A' }}>{config.effectiveUtil.toFixed(0)}%</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total Model Mem</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {config.totalModelMemGB >= 1000 ? `${(config.totalModelMemGB / 1000).toFixed(1)}TB` : `${config.totalModelMemGB.toFixed(0)}GB`}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Per GPU</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: config.fitsInMemory ? '#8BA888' : '#C76B4A' }}>
            {config.totalMemPerGPU.toFixed(1)}GB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Throughput</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {config.tokensPerSecTotal >= 1e6 ? `${(config.tokensPerSecTotal / 1e6).toFixed(1)}M` : `${(config.tokensPerSecTotal / 1e3).toFixed(0)}K`} tok/s
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Utilization</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: config.effectiveUtil >= 70 ? '#8BA888' : '#C76B4A' }}>
            {config.effectiveUtil.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Reference configs */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>Reference Configurations</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.4rem' }}>
          {KNOWN_CONFIGS.map(cfg => (
            <button key={cfg.name} onClick={() => { setModelSize(cfg.params); setGpuMemory(cfg.gpuMem); setTotalGPUs(cfg.gpus); }}
              style={{ fontSize: '0.58rem', color: '#5A6B5C', padding: '0.3rem 0.4rem', background: 'transparent', border: '1px solid #E5DFD3', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>{cfg.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.5rem', color: '#7A8B7C' }}>
                TP={cfg.tp} PP={cfg.pp} DP={cfg.dp}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {!config.fitsInMemory
            ? `The current configuration does not fit in ${gpuMemory}GB GPU memory (needs ${config.totalMemPerGPU.toFixed(1)}GB per GPU). Increase TP or PP degree, or use GPUs with more memory. The optimizer states (Adam) consume 3x the model weight memory -- this is typically the largest component.`
            : modelSize <= 13
            ? `A ${formatParams(modelSize)} model fits comfortably on a single GPU with ${gpuMemory}GB memory. Data parallelism alone (DP=${config.suggestedDP}) is sufficient. No need for model parallelism at this scale -- adding TP or PP would only increase communication overhead.`
            : `For ${formatParams(modelSize)}, the optimizer states alone require ${config.optimizerPerGPU.toFixed(1)}GB per GPU (${((config.optimizerPerGPU / config.totalMemPerGPU) * 100).toFixed(0)}% of memory). The suggested TP=${config.suggestedTP}, PP=${config.suggestedPP} splits the model small enough to fit, while DP=${config.suggestedDP} provides training throughput. Communication overhead costs ~${config.totalOverhead.toFixed(0)}% of compute.`}
        </div>
      </div>
    </div>
  );
}
