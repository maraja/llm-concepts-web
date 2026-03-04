import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function GQAMemoryCalculator() {
  const [seqLen, setSeqLen] = useState(4096);
  const [numLayers, setNumLayers] = useState(32);
  const [numHeads, setNumHeads] = useState(32);
  const [dHead] = useState(128);
  const [numKVHeads, setNumKVHeads] = useState(8);

  const calc = useMemo(() => {
    const bytesPerParam = 2; // fp16
    const mhaKV = 2 * numLayers * numHeads * dHead * seqLen * bytesPerParam;
    const gqaKV = 2 * numLayers * numKVHeads * dHead * seqLen * bytesPerParam;
    const mqaKV = 2 * numLayers * 1 * dHead * seqLen * bytesPerParam;
    return { mha: mhaKV, gqa: gqaKV, mqa: mqaKV };
  }, [seqLen, numLayers, numHeads, dHead, numKVHeads]);

  const formatBytes = (b: number) => {
    if (b >= 1e9) return `${(b / 1e9).toFixed(2)} GB`;
    if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
    return `${(b / 1e3).toFixed(0)} KB`;
  };

  const savings = ((1 - calc.gqa / calc.mha) * 100).toFixed(0);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          KV Cache Memory Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Calculate KV cache memory usage for different attention configurations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Sequence Length', value: seqLen, set: setSeqLen, min: 512, max: 131072, step: 512, fmt: (v: number) => v.toLocaleString() },
          { label: 'Layers', value: numLayers, set: setNumLayers, min: 1, max: 128, step: 1, fmt: (v: number) => String(v) },
          { label: 'Query Heads', value: numHeads, set: setNumHeads, min: 1, max: 128, step: 1, fmt: (v: number) => String(v) },
          { label: 'KV Heads (GQA)', value: numKVHeads, set: setNumKVHeads, min: 1, max: numHeads, step: 1, fmt: (v: number) => String(v) },
        ].map(({ label, value, set, min, max, step, fmt }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#C76B4A', fontWeight: 600 }}>{fmt(value)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {[
          { label: 'MHA', sublabel: `${numHeads} KV heads`, value: calc.mha, color: '#C76B4A' },
          { label: 'GQA', sublabel: `${numKVHeads} KV heads`, value: calc.gqa, color: '#D4A843' },
          { label: 'MQA', sublabel: '1 KV head', value: calc.mqa, color: '#8BA888' },
        ].map(item => (
          <div key={item.label} style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{item.sublabel}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: item.color, marginTop: '0.3rem' }}>
              {formatBytes(item.value)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#3D524010', borderRadius: '6px', fontSize: '0.78rem', color: '#5A6B5C', textAlign: 'center' }}>
        GQA saves <strong style={{ color: '#3D5240' }}>{savings}%</strong> KV cache memory vs. standard MHA
      </div>
    </div>
  );
}
