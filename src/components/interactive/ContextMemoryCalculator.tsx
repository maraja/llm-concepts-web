import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function ContextMemoryCalculator() {
  const [seqLen, setSeqLen] = useState(4096);
  const [numLayers, setNumLayers] = useState(32);
  const [numHeads, setNumHeads] = useState(32);
  const [headDim, setHeadDim] = useState(128);

  const kvCachePerToken = useMemo(() => {
    // 2 (K+V) × num_layers × num_kv_heads × head_dim × 2 (bytes for fp16)
    return 2 * numLayers * numHeads * headDim * 2;
  }, [numLayers, numHeads, headDim]);

  const totalKVCache = useMemo(() => {
    return (kvCachePerToken * seqLen) / (1024 * 1024 * 1024); // GB
  }, [kvCachePerToken, seqLen]);

  const attentionFLOPs = useMemo(() => {
    // O(n²) attention: 2 * seq_len² * d_model * num_layers
    const dModel = numHeads * headDim;
    return (2 * seqLen * seqLen * dModel * numLayers) / 1e12; // TFLOPs
  }, [seqLen, numLayers, numHeads, headDim]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Context Window Cost
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Longer context = more KV cache memory + quadratic attention cost. See why long context is expensive.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Seq Length', value: seqLen, set: setSeqLen, min: 512, max: 131072, step: 512, fmt: (v: number) => v >= 1024 ? `${(v / 1024).toFixed(0)}K` : String(v) },
          { label: 'Layers', value: numLayers, set: setNumLayers, min: 4, max: 80, step: 4, fmt: (v: number) => String(v) },
          { label: 'KV Heads', value: numHeads, set: setNumHeads, min: 1, max: 64, step: 1, fmt: (v: number) => String(v) },
          { label: 'Head Dim', value: headDim, set: setHeadDim, min: 64, max: 256, step: 64, fmt: (v: number) => String(v) },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>KV Cache</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>
            {totalKVCache < 1 ? `${(totalKVCache * 1024).toFixed(0)}MB` : `${totalKVCache.toFixed(1)}GB`}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>per request</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Attention FLOPs</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#3D5240' }}>
            {attentionFLOPs < 1 ? `${(attentionFLOPs * 1000).toFixed(0)}G` : `${attentionFLOPs.toFixed(1)}T`}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>O(n²) cost</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Per-Token KV</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#D4A843' }}>
            {(kvCachePerToken / 1024).toFixed(0)}KB
          </div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>fp16</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        Doubling sequence length: KV cache <strong>2×</strong>, attention FLOPs <strong>4×</strong>. This is why techniques like GQA, sliding window, and sparse attention matter for long context.
      </div>
    </div>
  );
}
