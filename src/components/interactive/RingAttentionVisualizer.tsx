import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const GPU_COLORS = [
  '#5B8DB8', '#C76B4A', '#8BA888', '#D4A843',
  '#9B6B8E', '#6B9B8E', '#B88B5B', '#7B8DB8',
];

export default function RingAttentionVisualizer() {
  const [numGPUs, setNumGPUs] = useState(4);
  const [seqLengthK, setSeqLengthK] = useState(128);
  const [ringStep, setRingStep] = useState(0);

  const ring = useMemo(() => {
    const seqLength = seqLengthK * 1024;
    const chunkSize = Math.floor(seqLength / numGPUs);
    const chunkSizeK = chunkSize / 1024;

    // Each GPU starts with its Q chunk and corresponding KV chunk
    // At each step, KV blocks are passed to the next GPU in the ring
    const gpus = Array.from({ length: numGPUs }, (_, i) => ({
      id: i,
      qChunkStart: i * chunkSize,
      qChunkEnd: (i + 1) * chunkSize - 1,
      // At the current ring step, which KV block does this GPU hold?
      kvSource: (i - ringStep % numGPUs + numGPUs) % numGPUs,
    }));

    // Attention computation at this step: each GPU computes attention
    // between its Q chunk and the KV chunk it currently holds
    const computations = gpus.map(gpu => ({
      gpuId: gpu.id,
      qRange: `${(gpu.qChunkStart / 1024).toFixed(0)}K-${((gpu.qChunkEnd + 1) / 1024).toFixed(0)}K`,
      kvFrom: gpu.kvSource,
      kvRange: `${(gpu.kvSource * chunkSizeK).toFixed(0)}K-${((gpu.kvSource + 1) * chunkSizeK).toFixed(0)}K`,
      isSelfAttention: gpu.id === gpu.kvSource,
    }));

    // Memory per GPU
    // Q chunk: seq_len/N * hidden_dim * 2 bytes
    // KV chunk (current): seq_len/N * hidden_dim * 2 * 2 bytes (K and V)
    // Partial attention output: seq_len/N * hidden_dim * 2 bytes
    const hiddenDim = 8192;
    const bytesPerElement = 2; // FP16
    const qMemGB = (chunkSize * hiddenDim * bytesPerElement) / 1e9;
    const kvMemGB = (chunkSize * hiddenDim * bytesPerElement * 2) / 1e9; // K + V
    const outputMemGB = (chunkSize * hiddenDim * bytesPerElement) / 1e9;
    const totalPerGPU = qMemGB + kvMemGB + outputMemGB;

    // Single GPU memory for full sequence
    const singleGPUMem = (seqLength * hiddenDim * bytesPerElement * 4) / 1e9; // Q + K + V + output

    // Communication: each step sends KV block to next GPU
    const commPerStep = kvMemGB;
    const totalComm = commPerStep * (numGPUs - 1); // total over all steps

    // Communication can overlap with computation
    // Compute time for one chunk: O(chunk_size^2 * hidden_dim)
    const computeFLOPs = chunkSize * chunkSize * hiddenDim * 2; // rough
    const commBytes = kvMemGB * 1e9;
    // Overlap ratio depends on compute/comm ratio
    const overlapRatio = Math.min(computeFLOPs / (commBytes * 1000), 1.0); // simplified

    return {
      seqLength,
      chunkSize,
      chunkSizeK,
      gpus,
      computations,
      qMemGB,
      kvMemGB,
      outputMemGB,
      totalPerGPU,
      singleGPUMem,
      commPerStep,
      totalComm,
      overlapRatio,
      totalSteps: numGPUs,
    };
  }, [numGPUs, seqLengthK, ringStep]);

  // Ring layout: position GPUs in a circle
  const ringRadius = 85;
  const centerX = 120;
  const centerY = 105;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Ring Attention Visualizer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how GPUs in a ring pass KV blocks to compute attention over sequences longer than any single GPU can hold. Each step, KV blocks rotate one position.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>GPUs in Ring</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numGPUs}</span>
          </div>
          <input type="range" min={2} max={8} step={1} value={numGPUs}
            onChange={e => { setNumGPUs(Number(e.target.value)); setRingStep(0); }}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Sequence Length</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>
              {seqLengthK >= 1000 ? `${(seqLengthK / 1000).toFixed(0)}M` : `${seqLengthK}K`}
            </span>
          </div>
          <input type="range" min={16} max={1024} step={16} value={seqLengthK}
            onChange={e => setSeqLengthK(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#7A8B7C' }}>
            <span>16K</span><span>1M</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Ring Step</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{ringStep} / {numGPUs - 1}</span>
          </div>
          <input type="range" min={0} max={numGPUs - 1} step={1} value={ringStep}
            onChange={e => setRingStep(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Ring visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          RING TOPOLOGY (step {ringStep}: KV blocks rotated {ringStep} position{ringStep !== 1 ? 's' : ''})
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Ring SVG */}
          <div style={{ position: 'relative', width: '240px', height: '210px', flexShrink: 0 }}>
            <svg width="240" height="210" viewBox="0 0 240 210">
              {/* Ring circle (background) */}
              <circle cx={centerX} cy={centerY} r={ringRadius} fill="none" stroke="#E5DFD3" strokeWidth="2" />

              {/* Arrows showing KV transfer direction */}
              {Array.from({ length: numGPUs }, (_, i) => {
                const angle1 = (2 * Math.PI * i) / numGPUs - Math.PI / 2;
                const angle2 = (2 * Math.PI * ((i + 1) % numGPUs)) / numGPUs - Math.PI / 2;
                const midAngle = (angle1 + angle2) / 2;
                // If angles wrap around, adjust
                const adjustedMidAngle = angle2 < angle1 ? midAngle + Math.PI : midAngle;

                const arrowR = ringRadius - 5;
                const ax = centerX + arrowR * Math.cos(adjustedMidAngle);
                const ay = centerY + arrowR * Math.sin(adjustedMidAngle);

                return (
                  <g key={`arrow-${i}`}>
                    {/* Arrow on the arc */}
                    <circle cx={ax} cy={ay} r={3} fill={ringStep > 0 ? '#C76B4A' : '#E5DFD3'} opacity={ringStep > 0 ? 0.7 : 0.3} />
                  </g>
                );
              })}

              {/* GPU nodes */}
              {Array.from({ length: numGPUs }, (_, i) => {
                const angle = (2 * Math.PI * i) / numGPUs - Math.PI / 2;
                const x = centerX + ringRadius * Math.cos(angle);
                const y = centerY + ringRadius * Math.sin(angle);
                const kvSource = ring.computations[i]?.kvSource ?? i;
                const gpuColor = GPU_COLORS[i % GPU_COLORS.length];
                const kvColor = GPU_COLORS[kvSource % GPU_COLORS.length];

                return (
                  <g key={`gpu-${i}`}>
                    {/* GPU circle */}
                    <circle cx={x} cy={y} r={22} fill={gpuColor} opacity={0.9} />
                    <text x={x} y={y - 5} textAnchor="middle" fill="#FDFBF7" fontSize="8" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
                      GPU {i}
                    </text>
                    <text x={x} y={y + 5} textAnchor="middle" fill="#FDFBF7" fontSize="6" fontFamily="'JetBrains Mono', monospace" opacity={0.8}>
                      Q:{(i * ring.chunkSizeK).toFixed(0)}K
                    </text>
                    <text x={x} y={y + 13} textAnchor="middle" fill="#FDFBF7" fontSize="6" fontFamily="'JetBrains Mono', monospace" opacity={0.8}>
                      KV:{(kvSource * ring.chunkSizeK).toFixed(0)}K
                    </text>
                    {/* KV source indicator */}
                    {kvSource !== i && (
                      <circle cx={x + 16} cy={y - 16} r={5} fill={kvColor} stroke="#FDFBF7" strokeWidth="1" />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Step-by-step computation table */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.62rem', color: '#7A8B7C', fontWeight: 600, marginBottom: '0.3rem' }}>COMPUTATIONS AT THIS STEP</div>
            {ring.computations.map(comp => (
              <div key={comp.gpuId} style={{
                display: 'grid', gridTemplateColumns: '50px 1fr',
                gap: '0.3rem', padding: '0.2rem 0.3rem', marginBottom: '2px',
                background: comp.isSelfAttention ? 'rgba(139, 168, 136, 0.15)' : 'rgba(199, 107, 74, 0.08)',
                borderRadius: '4px',
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', fontWeight: 600, color: GPU_COLORS[comp.gpuId % GPU_COLORS.length] }}>
                  GPU {comp.gpuId}
                </span>
                <span style={{ fontSize: '0.55rem', color: '#5A6B5C' }}>
                  Q[{comp.qRange}] x KV[{comp.kvRange}]
                  {comp.isSelfAttention ? ' (local)' : ` (from GPU ${comp.kvFrom})`}
                </span>
              </div>
            ))}
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C', marginTop: '0.3rem' }}>
              After {numGPUs} steps, every Q chunk has attended to all KV chunks
            </div>
          </div>
        </div>
      </div>

      {/* Per-GPU memory breakdown */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          PER-GPU MEMORY (h={8192})
        </div>
        {[
          { label: `Q chunk (${ring.chunkSizeK.toFixed(0)}K tokens)`, value: ring.qMemGB, color: '#5B8DB8' },
          { label: `KV chunk (${ring.chunkSizeK.toFixed(0)}K tokens, K+V)`, value: ring.kvMemGB, color: '#D4A843' },
          { label: 'Partial output', value: ring.outputMemGB, color: '#8BA888' },
        ].map(item => {
          const pct = ring.totalPerGPU > 0 ? (item.value / ring.totalPerGPU) * 100 : 0;
          return (
            <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 55px', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0' }}>
              <span style={{ fontSize: '0.62rem', color: '#2C3E2D' }}>{item.label}</span>
              <div style={{ height: '14px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '3px', transition: 'width 0.3s ease' }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: '#7A8B7C', textAlign: 'right' }}>{item.value.toFixed(2)}GB</span>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Per GPU Mem</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {ring.totalPerGPU.toFixed(1)}GB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Single GPU</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {ring.singleGPUMem.toFixed(1)}GB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Mem Savings</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#3D5240' }}>
            {ring.singleGPUMem > 0 ? ((1 - ring.totalPerGPU / ring.singleGPUMem) * 100).toFixed(0) : 0}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Comm Overlap</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {(ring.overlapRatio * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Communication details */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>Communication per Ring Step</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6rem', color: '#5A6B5C' }}>
            <span style={{ fontWeight: 600 }}>KV block size</span>: {ring.commPerStep.toFixed(3)} GB
          </span>
          <span style={{ fontSize: '0.6rem', color: '#5A6B5C' }}>
            <span style={{ fontWeight: 600 }}>Total comm</span>: {ring.totalComm.toFixed(2)} GB ({numGPUs - 1} transfers)
          </span>
          <span style={{ fontSize: '0.6rem', color: '#5A6B5C' }}>
            <span style={{ fontWeight: 600 }}>Key advantage</span>: Each send overlaps with the current step's computation
          </span>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {ringStep === 0
            ? `At step 0, each GPU computes self-attention on its local Q and KV chunks (${ring.chunkSizeK.toFixed(0)}K tokens each). No communication has occurred yet. The full ${seqLengthK >= 1000 ? `${(seqLengthK / 1000).toFixed(0)}M` : `${seqLengthK}K`} sequence is split across ${numGPUs} GPUs, reducing per-GPU memory from ${ring.singleGPUMem.toFixed(1)}GB to ${ring.totalPerGPU.toFixed(1)}GB.`
            : `At step ${ringStep}, each GPU has received KV blocks that have traveled ${ringStep} positions around the ring. After all ${numGPUs} steps, every GPU will have computed attention between its Q chunk and all KV chunks from the full sequence. The key insight: while computing attention on the current KV block, the previous KV block is being sent to the next GPU -- communication is fully overlapped with computation.`}
        </div>
      </div>
    </div>
  );
}
