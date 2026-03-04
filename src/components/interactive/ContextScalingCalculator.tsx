import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const REFERENCE_MODELS = [
  { name: 'GPT-4', context: 128, method: 'Standard', gpus: 1 },
  { name: 'LLaMA 3.1', context: 128, method: 'Gradual extension', gpus: 1 },
  { name: 'Claude 3', context: 200, method: 'Unknown', gpus: 1 },
  { name: 'Gemini 1.5', context: 1000, method: 'Ring / distributed', gpus: 'N/A' },
  { name: 'Gemini 1.5 Pro', context: 2000, method: 'Ring / distributed', gpus: 'N/A' },
];

export default function ContextScalingCalculator() {
  const [numGPUs, setNumGPUs] = useState(8);
  const [perGPUMemGB, setPerGPUMemGB] = useState(80);
  const [hiddenDim, setHiddenDim] = useState(8192);
  const [numHeads, setNumHeads] = useState(64);
  const [numLayers, setNumLayers] = useState(80);

  const calc = useMemo(() => {
    // Memory for attention per token (KV cache):
    // Each layer needs: 2 * hidden_dim * bytes_per_element (K and V)
    // Per token KV memory: num_layers * 2 * hidden_dim * 2 (FP16)
    const bytesPerElement = 2; // FP16
    const kvBytesPerToken = numLayers * 2 * hiddenDim * bytesPerElement;
    const kvGBPerToken = kvBytesPerToken / 1e9;

    // Attention computation memory per token pair:
    // Each attention head: seq_len attention scores
    // Total for all heads: num_heads * seq_len * bytes
    // This is the O(n^2) component

    // Usable memory for KV cache (subtract model weights, activations, etc.)
    // Model params estimate: ~2 * hidden_dim * hidden_dim * num_layers * 4 (FFN) + embeddings
    const estimatedParams = (4 * hiddenDim * hiddenDim * numLayers * 2 + hiddenDim * 100000) * bytesPerElement;
    const modelMemGB = estimatedParams / 1e9;
    // Leave room for activations and framework overhead
    const usableMemPerGPU = Math.max(perGPUMemGB * 0.6 - modelMemGB / numGPUs, perGPUMemGB * 0.2);

    // Single GPU: max context limited by KV cache memory
    const singleGPUMaxTokens = Math.floor((usableMemPerGPU * 1e9) / kvBytesPerToken);
    const singleGPUMaxK = singleGPUMaxTokens / 1024;

    // Ring attention: memory scales linearly with GPUs
    // Each GPU holds seq_len/N tokens worth of KV cache
    // But total sequence can be N times longer
    const ringMaxTokens = singleGPUMaxTokens * numGPUs;
    const ringMaxK = ringMaxTokens / 1024;

    // Quadratic attention memory: attention scores matrix
    // Single GPU: seq_len^2 * num_heads * bytes (stored per head)
    // But FlashAttention doesn't materialize full matrix, so this is chunked
    // Ring attention similarly chunks the attention computation

    // Communication overhead per ring step:
    // Send KV chunk of size: (seq_len/N) * hidden_dim * 2 * 2 bytes
    const kvChunkGB = (ringMaxTokens / numGPUs) * hiddenDim * 2 * bytesPerElement / 1e9;
    const totalCommGB = kvChunkGB * (numGPUs - 1); // N-1 steps

    // Compute time for one chunk pair (rough estimate)
    // FLOPs per attention: 2 * seq_chunk^2 * hidden_dim * num_layers
    const chunkTokens = ringMaxTokens / numGPUs;
    const computeFLOPs = 2 * chunkTokens * chunkTokens * hiddenDim * numLayers;
    // Communication bytes
    const commBytes = kvChunkGB * 1e9;

    // Overlap efficiency: compute/comm ratio determines how well they overlap
    // Higher ratio = better overlap (comm is hidden behind compute)
    const computeCommRatio = computeFLOPs / (commBytes * 500); // rough normalization
    const overlapEfficiency = Math.min(computeCommRatio / (1 + computeCommRatio), 0.95);

    // Effective communication overhead (after overlap)
    const rawCommOverhead = numGPUs > 1 ? (numGPUs - 1) / numGPUs : 0; // fraction of time spent on comm if no overlap
    const effectiveCommOverhead = rawCommOverhead * (1 - overlapEfficiency);

    // Memory comparison
    const singleGPUTotalMem = perGPUMemGB;
    const ringTotalMem = perGPUMemGB * numGPUs;

    return {
      kvGBPerToken,
      kvBytesPerToken,
      modelMemGB,
      usableMemPerGPU,
      singleGPUMaxTokens,
      singleGPUMaxK,
      ringMaxTokens,
      ringMaxK,
      kvChunkGB,
      totalCommGB,
      overlapEfficiency,
      effectiveCommOverhead,
      singleGPUTotalMem,
      ringTotalMem,
      scalingFactor: numGPUs,
      chunkTokens,
    };
  }, [numGPUs, perGPUMemGB, hiddenDim, numHeads, numLayers]);

  const formatContext = (k: number) => {
    if (k >= 1000) return `${(k / 1000).toFixed(1)}M`;
    return `${k.toFixed(0)}K`;
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Context Scaling Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Calculate how ring attention scales maximum context length. More GPUs linearly increase the processable sequence length while keeping per-GPU memory constant.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Number of GPUs</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numGPUs}</span>
          </div>
          <input type="range" min={1} max={64} step={1} value={numGPUs}
            onChange={e => setNumGPUs(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Per-GPU Memory</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{perGPUMemGB} GB</span>
          </div>
          <input type="range" min={24} max={80} step={8} value={perGPUMemGB}
            onChange={e => setPerGPUMemGB(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Hidden Dimension</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{hiddenDim}</span>
          </div>
          <input type="range" min={2048} max={16384} step={1024} value={hiddenDim}
            onChange={e => setHiddenDim(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Attention Heads</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numHeads}</span>
          </div>
          <input type="range" min={8} max={128} step={8} value={numHeads}
            onChange={e => setNumHeads(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Layers</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numLayers}</span>
          </div>
          <input type="range" min={12} max={128} step={4} value={numLayers}
            onChange={e => setNumLayers(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Context length comparison: single GPU vs ring */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          MAXIMUM CONTEXT LENGTH
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: 'rgba(199, 107, 74, 0.1)', borderRadius: '8px', border: '1px solid rgba(199, 107, 74, 0.3)' }}>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Single GPU</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: '#C76B4A' }}>
              {formatContext(calc.singleGPUMaxK)}
            </div>
          </div>
          <div style={{ fontSize: '1.2rem', color: '#7A8B7C' }}>{'\u2192'}</div>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: 'rgba(139, 168, 136, 0.1)', borderRadius: '8px', border: '1px solid rgba(139, 168, 136, 0.3)' }}>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Ring Attention ({numGPUs} GPUs)</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: '#8BA888' }}>
              {formatContext(calc.ringMaxK)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#D4A843' }}>
              {calc.scalingFactor}x
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>scaling</div>
          </div>
        </div>

        {/* Bar comparison */}
        <div style={{ marginBottom: '0.3rem' }}>
          {[
            { label: `1 GPU (${perGPUMemGB}GB)`, value: calc.singleGPUMaxK, color: '#C76B4A' },
            { label: `${numGPUs} GPUs (Ring Attention)`, value: calc.ringMaxK, color: '#8BA888' },
          ].map(item => (
            <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 60px', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <span style={{ fontSize: '0.62rem', color: '#2C3E2D' }}>{item.label}</span>
              <div style={{ height: '18px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${calc.ringMaxK > 0 ? (item.value / calc.ringMaxK) * 100 : 0}%`,
                  background: item.color, borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: '#7A8B7C', textAlign: 'right' }}>{formatContext(item.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Memory usage comparison */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          MEMORY ANALYSIS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#5A6B5C', fontWeight: 600, marginBottom: '0.3rem' }}>KV Cache per Token</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#C76B4A', fontWeight: 600 }}>
              {calc.kvBytesPerToken >= 1e6 ? `${(calc.kvBytesPerToken / 1e6).toFixed(2)} MB` : `${(calc.kvBytesPerToken / 1024).toFixed(0)} KB`}
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>{numLayers} layers x 2 x {hiddenDim} x 2B</div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#5A6B5C', fontWeight: 600, marginBottom: '0.3rem' }}>Model Weights (est.)</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#5B8DB8', fontWeight: 600 }}>
              {calc.modelMemGB.toFixed(1)} GB
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>{(calc.modelMemGB / numGPUs).toFixed(1)} GB per GPU (sharded)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#5A6B5C', fontWeight: 600, marginBottom: '0.3rem' }}>Usable KV Memory / GPU</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#8BA888', fontWeight: 600 }}>
              {calc.usableMemPerGPU.toFixed(1)} GB
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>after model weights + overhead</div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#5A6B5C', fontWeight: 600, marginBottom: '0.3rem' }}>Total Cluster Memory</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#D4A843', fontWeight: 600 }}>
              {calc.ringTotalMem >= 1000 ? `${(calc.ringTotalMem / 1000).toFixed(1)} TB` : `${calc.ringTotalMem} GB`}
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>{numGPUs} x {perGPUMemGB} GB</div>
          </div>
        </div>
      </div>

      {/* Communication overhead */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          COMMUNICATION OVERHEAD
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase' }}>KV Chunk Size</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#5B8DB8' }}>
              {calc.kvChunkGB.toFixed(3)} GB
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase' }}>Overlap Efficiency</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: calc.overlapEfficiency > 0.8 ? '#8BA888' : '#D4A843' }}>
              {(calc.overlapEfficiency * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase' }}>Effective Overhead</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: calc.effectiveCommOverhead < 0.1 ? '#8BA888' : '#C76B4A' }}>
              {(calc.effectiveCommOverhead * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        {/* Overhead bar */}
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ height: '16px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${(1 - calc.effectiveCommOverhead) * 100}%`, height: '100%', background: '#8BA888', transition: 'width 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#FDFBF7', fontWeight: 600 }}>
              Compute
            </div>
            <div style={{ width: `${calc.effectiveCommOverhead * 100}%`, height: '100%', background: '#C76B4A', transition: 'width 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#FDFBF7', fontWeight: 600 }}>
              {calc.effectiveCommOverhead > 0.03 ? 'Comm' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Max Context</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {formatContext(calc.ringMaxK)}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Chunk / GPU</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#5B8DB8' }}>
            {formatContext(calc.ringMaxK / numGPUs)}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Ring Steps</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {numGPUs}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Scaling</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {numGPUs}x linear
          </div>
        </div>
      </div>

      {/* Reference models */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>Real-World Context Lengths</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {REFERENCE_MODELS.map(m => (
            <span key={m.name} style={{ fontSize: '0.58rem', color: '#5A6B5C' }}>
              <span style={{ fontWeight: 600 }}>{m.name}</span>: {formatContext(m.context)}
            </span>
          ))}
        </div>
        {/* Visual scale */}
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ height: '12px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
            {REFERENCE_MODELS.map((m, i) => {
              const maxCtx = Math.max(...REFERENCE_MODELS.map(r => r.context), calc.ringMaxK);
              const pos = (m.context / maxCtx) * 100;
              return (
                <div key={m.name} style={{
                  position: 'absolute', left: `${pos}%`, top: 0, bottom: 0, width: '2px',
                  background: '#7A8B7C', opacity: 0.6,
                }} />
              );
            })}
            {/* Ring attention achievable */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${(calc.ringMaxK / Math.max(...REFERENCE_MODELS.map(r => r.context), calc.ringMaxK)) * 100}%`,
              background: 'rgba(139, 168, 136, 0.3)', borderRadius: '3px',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.45rem', color: '#7A8B7C', marginTop: '0.15rem' }}>
            <span>0</span>
            <span>{formatContext(Math.max(...REFERENCE_MODELS.map(r => r.context), calc.ringMaxK))}</span>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {numGPUs === 1
            ? `With a single ${perGPUMemGB}GB GPU, maximum context is ~${formatContext(calc.singleGPUMaxK)} tokens (limited by KV cache memory of ${calc.kvBytesPerToken >= 1e6 ? `${(calc.kvBytesPerToken / 1e6).toFixed(1)}MB` : `${(calc.kvBytesPerToken / 1024).toFixed(0)}KB`} per token across ${numLayers} layers). Ring attention scales this linearly -- add more GPUs to process longer sequences with near-zero communication overhead thanks to compute-communication overlap.`
            : `Ring attention with ${numGPUs} GPUs extends max context from ${formatContext(calc.singleGPUMaxK)} to ${formatContext(calc.ringMaxK)} (${numGPUs}x scaling). Each GPU holds a ${formatContext(calc.ringMaxK / numGPUs)}-token chunk and computes attention against all chunks via ${numGPUs} ring steps. Communication overlap efficiency is ${(calc.overlapEfficiency * 100).toFixed(0)}%, keeping effective overhead at just ${(calc.effectiveCommOverhead * 100).toFixed(1)}%. This linear scaling is the key insight: context length is limited by aggregate memory, not single-GPU memory.`}
        </div>
      </div>
    </div>
  );
}
