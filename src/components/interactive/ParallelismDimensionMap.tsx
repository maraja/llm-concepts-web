import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const GPU_COLORS = {
  tp: '#5B8DB8',
  pp: '#D4A843',
  dp: '#8BA888',
  inactive: '#E5DFD3',
};

export default function ParallelismDimensionMap() {
  const [tpDegree, setTpDegree] = useState(4);
  const [ppDegree, setPpDegree] = useState(4);
  const [dpDegree, setDpDegree] = useState(4);

  const calc = useMemo(() => {
    const totalGPUs = tpDegree * ppDegree * dpDegree;
    const gpusPerNode = 8;
    const nodesRequired = Math.ceil(totalGPUs / gpusPerNode);

    // Model mapping: assume 175B GPT-3 like model
    const modelParams = 175;
    const paramsPerTPGroup = modelParams / tpDegree;
    const layersPerStage = Math.round(96 / ppDegree);
    const memoryPerGPU_model = (modelParams * 2) / (tpDegree * ppDegree); // FP16 bytes / GPU
    const memoryPerGPU_optimizer = memoryPerGPU_model * 3; // Adam states (FP32 weights + m + v)
    const totalMemPerGPU = memoryPerGPU_model + memoryPerGPU_optimizer;

    // Communication analysis
    const tpCommVolume = paramsPerTPGroup * 2; // All-reduce within TP group (2x for reduce-scatter + all-gather)
    const ppCommVolume = paramsPerTPGroup * 0.1; // Activation transfers between stages
    const dpCommVolume = paramsPerTPGroup * 2; // All-reduce gradients across DP replicas

    // Build GPU grid: dp rows, pp columns, each cell has tp GPUs
    const grid: { gpuId: number; dp: number; pp: number; tp: number }[][][] = [];
    let gpuId = 0;
    for (let d = 0; d < dpDegree; d++) {
      const dpRow: { gpuId: number; dp: number; pp: number; tp: number }[][] = [];
      for (let p = 0; p < ppDegree; p++) {
        const tpGroup: { gpuId: number; dp: number; pp: number; tp: number }[] = [];
        for (let t = 0; t < tpDegree; t++) {
          tpGroup.push({ gpuId: gpuId++, dp: d, pp: p, tp: t });
        }
        dpRow.push(tpGroup);
      }
      grid.push(dpRow);
    }

    return {
      totalGPUs,
      nodesRequired,
      gpusPerNode,
      paramsPerTPGroup,
      layersPerStage,
      memoryPerGPU_model,
      totalMemPerGPU,
      tpCommVolume,
      ppCommVolume,
      dpCommVolume,
      grid,
    };
  }, [tpDegree, ppDegree, dpDegree]);

  // Limit visual grid to show at most 4 DP replicas, 8 PP stages, 8 TP
  const visDP = Math.min(dpDegree, 4);
  const visPP = Math.min(ppDegree, 8);
  const visTP = Math.min(tpDegree, 8);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          3D Parallelism Dimension Map
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Visualize how data, tensor, and pipeline parallelism map to a GPU topology. Each cell represents a tensor-parallel group within a pipeline stage and data-parallel replica.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Tensor Parallel (TP)', value: tpDegree, set: setTpDegree, min: 1, max: 8, step: 1, color: GPU_COLORS.tp },
          { label: 'Pipeline Parallel (PP)', value: ppDegree, set: setPpDegree, min: 1, max: 8, step: 1, color: GPU_COLORS.pp },
          { label: 'Data Parallel (DP)', value: dpDegree, set: setDpDegree, min: 1, max: 16, step: 1, color: GPU_COLORS.dp },
        ].map(({ label, value, set, min, max, step, color }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color, fontWeight: 600 }}>{value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      {/* Total GPU formula */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>TOTAL GPU CALCULATION</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: GPU_COLORS.tp }}>{tpDegree}</div>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>TP</div>
          </div>
          <span style={{ fontSize: '1.2rem', color: '#7A8B7C' }}>{'\u00D7'}</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: GPU_COLORS.pp }}>{ppDegree}</div>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>PP</div>
          </div>
          <span style={{ fontSize: '1.2rem', color: '#7A8B7C' }}>{'\u00D7'}</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: GPU_COLORS.dp }}>{dpDegree}</div>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>DP</div>
          </div>
          <span style={{ fontSize: '1.2rem', color: '#7A8B7C' }}>=</span>
          <div style={{ textAlign: 'center', padding: '0.3rem 0.6rem', background: 'rgba(199, 107, 74, 0.1)', borderRadius: '6px' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem', fontWeight: 700, color: '#C76B4A' }}>{calc.totalGPUs}</div>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>total GPUs</div>
          </div>
        </div>
      </div>

      {/* GPU Topology Grid */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          GPU TOPOLOGY {dpDegree > visDP || ppDegree > visPP || tpDegree > visTP ? `(showing ${visDP}/${dpDegree} DP, ${visPP}/${ppDegree} PP, ${visTP}/${tpDegree} TP)` : ''}
        </div>
        {/* Column headers: PP stages */}
        <div style={{ display: 'flex', marginBottom: '0.25rem', paddingLeft: '60px' }}>
          {Array.from({ length: visPP }, (_, p) => (
            <div key={p} style={{ flex: 1, textAlign: 'center', fontSize: '0.55rem', color: GPU_COLORS.pp, fontWeight: 600 }}>
              Stage {p}
            </div>
          ))}
        </div>
        {/* Grid rows: each DP replica */}
        {Array.from({ length: visDP }, (_, d) => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
            <div style={{ width: '60px', fontSize: '0.55rem', color: GPU_COLORS.dp, fontWeight: 600, textAlign: 'right', paddingRight: '8px' }}>
              Replica {d}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${visPP}, 1fr)`, gap: '3px' }}>
              {Array.from({ length: visPP }, (_, p) => (
                <div key={p} style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(visTP, 4)}, 1fr)`,
                  gap: '1px',
                  background: '#E5DFD3',
                  borderRadius: '4px',
                  padding: '2px',
                  border: '1px solid #D5CFC3',
                }}>
                  {Array.from({ length: visTP }, (_, t) => {
                    const globalId = d * ppDegree * tpDegree + p * tpDegree + t;
                    const nodeId = Math.floor(globalId / calc.gpusPerNode);
                    // Alternate node colors for clarity
                    const nodeHue = nodeId % 2 === 0 ? GPU_COLORS.tp : '#6A9DC8';
                    return (
                      <div key={t} style={{
                        background: nodeHue,
                        borderRadius: '2px',
                        height: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.4rem', color: '#FDFBF7', fontWeight: 600,
                        opacity: 0.8 + (t / visTP) * 0.2,
                        transition: 'all 0.2s ease',
                      }}>
                        {calc.totalGPUs <= 128 ? `G${globalId}` : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {[
            { label: 'TP group (intra-node, NVLink)', color: GPU_COLORS.tp },
            { label: 'PP stage (inter-node, NVLink/IB)', color: GPU_COLORS.pp },
            { label: 'DP replica (inter-node, IB)', color: GPU_COLORS.dp },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
              <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Model mapping (175B) */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>GPT-3 175B MODEL MAPPING</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#5A6B5C', marginBottom: '0.15rem' }}>Params per TP group</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600, color: GPU_COLORS.tp }}>
              {calc.paramsPerTPGroup.toFixed(1)}B
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#5A6B5C', marginBottom: '0.15rem' }}>Layers per PP stage</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600, color: GPU_COLORS.pp }}>
              {calc.layersPerStage} / 96
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#5A6B5C', marginBottom: '0.15rem' }}>Memory per GPU</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600, color: '#C76B4A' }}>
              {calc.totalMemPerGPU.toFixed(1)} GB
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total GPUs</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>{calc.totalGPUs}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Nodes (8 GPU)</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>{calc.nodesRequired}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Mem / GPU</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#8BA888' }}>{calc.totalMemPerGPU.toFixed(0)}GB</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Layers/Stage</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#5B8DB8' }}>{calc.layersPerStage}</div>
        </div>
      </div>

      {/* Known configs */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>Known 3D Parallelism Configs</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { name: 'GPT-3 175B', config: 'TP=8, PP=8, DP=8 (512 GPUs)' },
            { name: 'Megatron-Turing 530B', config: 'TP=8, PP=35, DP=6 (1680 GPUs)' },
            { name: 'LLaMA 3 405B', config: 'TP=8, PP=16, DP=? (16K GPUs)' },
          ].map(m => (
            <span key={m.name} style={{ fontSize: '0.6rem', color: '#5A6B5C' }}>
              <span style={{ fontWeight: 600 }}>{m.name}</span>: {m.config}
            </span>
          ))}
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {tpDegree > calc.gpusPerNode
            ? `Warning: TP degree (${tpDegree}) exceeds GPUs per node (${calc.gpusPerNode}). Tensor parallelism should stay within a single node to use fast NVLink interconnects. Cross-node TP over InfiniBand adds significant latency to every layer.`
            : tpDegree === 1 && ppDegree === 1
            ? `With no model parallelism (TP=1, PP=1), each GPU holds the entire model. This works for smaller models but fails when model size exceeds single-GPU memory. Add TP to split layers across GPUs within a node, or PP to distribute layers across nodes.`
            : `TP=${tpDegree} splits each layer across ${tpDegree} GPUs (best within one node via NVLink). PP=${ppDegree} distributes ${calc.layersPerStage} layers per stage across nodes. DP=${dpDegree} replicates this setup ${dpDegree} times for throughput. Total: ${calc.totalGPUs} GPUs across ${calc.nodesRequired} nodes.`}
        </div>
      </div>
    </div>
  );
}
