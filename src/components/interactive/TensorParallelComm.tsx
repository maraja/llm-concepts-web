import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function TensorParallelComm() {
  const [hiddenDim, setHiddenDim] = useState(4096);
  const [tpDegree, setTpDegree] = useState(4);
  const [seqLength, setSeqLength] = useState(2048);
  const [numLayers, setNumLayers] = useState(32);

  const calc = useMemo(() => {
    const bytesPerElement = 2; // FP16/BF16

    // Per transformer layer: 2 all-reduce ops (one in MLP, one in attention)
    // Each all-reduce moves 2*(N-1)/N * activationSize bytes
    // Activation size per all-reduce: seqLength * hiddenDim * bytesPerElement (per micro-batch)
    const activationSize = seqLength * hiddenDim * bytesPerElement;
    const allReducePerOp = 2 * ((tpDegree - 1) / tpDegree) * activationSize;
    const opsPerLayer = 4; // 2 in forward (attention + MLP), 2 in backward
    const commPerLayer = allReducePerOp * opsPerLayer;
    const totalComm = commPerLayer * numLayers;

    // Compare across TP degrees
    const tpComparison = [1, 2, 4, 8].map(tp => {
      if (tp === 1) return { tp, commGB: 0, commMs: 0, label: 'No TP' };
      const ar = 2 * ((tp - 1) / tp) * activationSize;
      const perLayer = ar * opsPerLayer;
      const total = perLayer * numLayers;
      // NVLink bandwidth: ~300 GB/s within node
      const nvlinkTime = total / (300e9) * 1000; // ms
      // PCIe bandwidth: ~32 GB/s
      const pcieTime = total / (32e9) * 1000;
      return {
        tp,
        commGB: total / 1e9,
        commMsNVLink: nvlinkTime,
        commMsPCIe: pcieTime,
        label: `TP=${tp}`,
      };
    });

    // Compute time estimate (rough)
    // FLOPs per layer: ~24 * seqLength * hiddenDim^2 (forward + backward)
    const flopsPerLayer = 24 * seqLength * hiddenDim * hiddenDim;
    const totalFLOPs = flopsPerLayer * numLayers;
    const gpuTFLOPS = 150; // A100 FP16
    const computeTime = totalFLOPs / (gpuTFLOPS * 1e12) * 1000; // ms per GPU

    const nvlinkOverhead = (totalComm / (300e9) * 1000) / (computeTime + totalComm / (300e9) * 1000) * 100;
    const pcieOverhead = (totalComm / (32e9) * 1000) / (computeTime + totalComm / (32e9) * 1000) * 100;
    const ibOverhead = (totalComm / (25e9) * 1000) / (computeTime + totalComm / (25e9) * 1000) * 100;

    return {
      activationSizeMB: activationSize / 1e6,
      commPerLayerMB: commPerLayer / 1e6,
      totalCommGB: totalComm / 1e9,
      tpComparison,
      nvlinkOverhead,
      pcieOverhead,
      ibOverhead,
      computeTimeMs: computeTime,
      nvlinkTimeMs: totalComm / (300e9) * 1000,
      pcieTimeMs: totalComm / (32e9) * 1000,
    };
  }, [hiddenDim, tpDegree, seqLength, numLayers]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Tensor Parallel Communication Cost
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Calculate communication overhead for tensor parallelism. See why TP works best within a node using NVLink, not across nodes.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Hidden Dimension', value: hiddenDim, set: setHiddenDim, min: 1024, max: 16384, step: 1024, fmt: (v: number) => v.toLocaleString() },
          { label: 'TP Degree', value: tpDegree, set: setTpDegree, min: 2, max: 8, step: 1, fmt: (v: number) => String(v) },
          { label: 'Sequence Length', value: seqLength, set: setSeqLength, min: 512, max: 8192, step: 512, fmt: (v: number) => v.toLocaleString() },
          { label: 'Number of Layers', value: numLayers, set: setNumLayers, min: 12, max: 96, step: 4, fmt: (v: number) => String(v) },
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

      {/* Per-layer breakdown */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          ALL-REDUCE VOLUME PER LAYER
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: '#D4A843' }}>4</div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>ops/layer</div>
          </div>
          <span style={{ fontSize: '1rem', color: '#7A8B7C' }}>{'\u00D7'}</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: '#C76B4A' }}>
              2({tpDegree}-1)/{tpDegree}
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>ring factor</div>
          </div>
          <span style={{ fontSize: '1rem', color: '#7A8B7C' }}>{'\u00D7'}</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: '#8BA888' }}>
              {calc.activationSizeMB.toFixed(1)} MB
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>activation</div>
          </div>
          <span style={{ fontSize: '1rem', color: '#7A8B7C' }}>=</span>
          <div style={{ textAlign: 'center', padding: '0.3rem 0.5rem', background: 'rgba(199, 107, 74, 0.1)', borderRadius: '6px' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 700, color: '#C76B4A' }}>
              {calc.commPerLayerMB.toFixed(1)} MB
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>per layer</div>
          </div>
        </div>
      </div>

      {/* TP degree comparison */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          COMMUNICATION OVERHEAD BY TP DEGREE
        </div>
        {calc.tpComparison.filter(c => c.tp > 1).map(c => {
          const maxComm = calc.tpComparison[calc.tpComparison.length - 1].commGB;
          const barW = maxComm > 0 ? (c.commGB / maxComm) * 100 : 0;
          const isSelected = c.tp === tpDegree;
          return (
            <div key={c.tp} style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#2C3E2D', fontWeight: isSelected ? 700 : 400 }}>
                  {c.label} {isSelected ? '(selected)' : ''}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: isSelected ? '#C76B4A' : '#7A8B7C', fontWeight: 600 }}>
                  {c.commGB.toFixed(2)} GB
                </span>
              </div>
              <div style={{ height: '14px', background: 'rgba(229, 223, 211, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(barW, 100)}%`, height: '100%',
                  background: isSelected ? '#C76B4A' : '#D4A843',
                  borderRadius: '4px', transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* NVLink vs PCIe vs InfiniBand */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          WHY TP NEEDS FAST INTERCONNECT
        </div>
        {[
          { label: 'NVLink (300 GB/s)', overhead: calc.nvlinkOverhead, time: calc.nvlinkTimeMs, color: '#8BA888' },
          { label: 'PCIe 4.0 (32 GB/s)', overhead: calc.pcieOverhead, time: calc.pcieTimeMs, color: '#D4A843' },
          { label: 'InfiniBand (25 GB/s)', overhead: calc.ibOverhead, time: calc.pcieTimeMs * 32 / 25, color: '#C76B4A' },
        ].map(item => (
          <div key={item.label} style={{ marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#2C3E2D' }}>{item.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: item.color, fontWeight: 600 }}>
                {item.overhead.toFixed(1)}% overhead ({item.time.toFixed(1)}ms)
              </span>
            </div>
            <div style={{ height: '14px', background: 'rgba(229, 223, 211, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(item.overhead, 100)}%`, height: '100%',
                background: item.color, borderRadius: '4px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total Comm</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {calc.totalCommGB.toFixed(2)} GB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Per Layer</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {calc.commPerLayerMB.toFixed(0)} MB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>NVLink</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {calc.nvlinkOverhead.toFixed(1)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>PCIe</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {calc.pcieOverhead.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {calc.pcieOverhead > 50
            ? `At hidden_dim=${hiddenDim.toLocaleString()} with TP=${tpDegree}, tensor parallelism requires ${calc.totalCommGB.toFixed(1)} GB of all-reduce communication per training step. Over PCIe, this causes ${calc.pcieOverhead.toFixed(0)}% overhead -- completely impractical. NVLink reduces this to ${calc.nvlinkOverhead.toFixed(1)}%. This is why tensor parallelism is always used within a single node where NVLink connects GPUs.`
            : `With TP=${tpDegree} across ${numLayers} layers, each layer needs ${calc.commPerLayerMB.toFixed(0)} MB of all-reduce communication. NVLink's ${300} GB/s bandwidth keeps overhead at just ${calc.nvlinkOverhead.toFixed(1)}%. Tensor parallelism communication scales with activation size (seq_len * hidden_dim), not model parameters, making it efficient for large hidden dimensions.`}
        </div>
      </div>
    </div>
  );
}
