import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function CheckpointMemoryTradeoff() {
  const [numLayers, setNumLayers] = useState(32);
  const [checkpointEvery, setCheckpointEvery] = useState(4);

  const calc = useMemo(() => {
    const memPerLayer = 1; // normalized unit

    // No checkpointing: store all activations
    const noCheckpointMemory = numLayers * memPerLayer;
    const noCheckpointRecompute = 0;

    // With checkpointing: store only checkpoint layers, recompute others in backward
    const numCheckpoints = Math.floor(numLayers / checkpointEvery);
    const checkpointMemory = numCheckpoints * memPerLayer + (checkpointEvery - 1) * memPerLayer;
    // Recompute: for each segment, recompute (checkpointEvery - 1) layers
    const recomputeLayers = numCheckpoints * (checkpointEvery - 1);
    const recomputeFraction = recomputeLayers / numLayers;

    // Optimal sqrt(N) strategy
    const sqrtN = Math.round(Math.sqrt(numLayers));
    const optimalCheckpoints = Math.ceil(numLayers / sqrtN);
    const optimalMemory = optimalCheckpoints * memPerLayer + (sqrtN - 1) * memPerLayer;
    const optimalRecompute = optimalCheckpoints * (sqrtN - 1);
    const optimalRecomputeFraction = optimalRecompute / numLayers;

    return {
      noCheckpoint: { memory: noCheckpointMemory, recompute: 0, recomputePct: 0 },
      current: { memory: checkpointMemory, recompute: recomputeLayers, recomputePct: recomputeFraction * 100 },
      optimal: { memory: optimalMemory, recompute: optimalRecompute, recomputePct: optimalRecomputeFraction * 100, sqrtN },
      memorySavings: ((1 - checkpointMemory / noCheckpointMemory) * 100),
      computeOverhead: recomputeFraction * 100,
    };
  }, [numLayers, checkpointEvery]);

  const maxMemory = calc.noCheckpoint.memory;

  const strategies = [
    { label: 'No Checkpointing', memory: calc.noCheckpoint.memory, recompute: calc.noCheckpoint.recomputePct, memColor: '#C76B4A', reColor: '#E5DFD3' },
    { label: `Every ${checkpointEvery} layers`, memory: calc.current.memory, recompute: calc.current.recomputePct, memColor: '#D4A843', reColor: '#D4A843' },
    { label: `Optimal (sqrt=${calc.optimal.sqrtN})`, memory: calc.optimal.memory, recompute: calc.optimal.recomputePct, memColor: '#8BA888', reColor: '#8BA888' },
  ];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Checkpoint Memory-Compute Tradeoff
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Gradient checkpointing trades compute for memory. Adjust the checkpoint frequency to see how it affects both.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Number of Layers</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{numLayers}</span>
          </div>
          <input type="range" min={12} max={96} step={4} value={numLayers}
            onChange={e => setNumLayers(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Checkpoint Every N Layers</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{checkpointEvery}</span>
          </div>
          <input type="range" min={1} max={Math.min(numLayers, 32)} step={1} value={checkpointEvery}
            onChange={e => setCheckpointEvery(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Bar chart: Memory usage */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>ACTIVATION MEMORY (NORMALIZED)</div>
        {strategies.map(s => (
          <div key={s.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 50px', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0' }}>
            <span style={{ fontSize: '0.7rem', color: '#2C3E2D', fontWeight: 500 }}>{s.label}</span>
            <div style={{ height: '20px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(s.memory / maxMemory) * 100}%`, background: s.memColor, borderRadius: '3px', transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#7A8B7C', textAlign: 'right' }}>{s.memory.toFixed(0)}u</span>
          </div>
        ))}
      </div>

      {/* Bar chart: Recomputation overhead */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>RECOMPUTATION OVERHEAD (%)</div>
        {strategies.map(s => (
          <div key={s.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 50px', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0' }}>
            <span style={{ fontSize: '0.7rem', color: '#2C3E2D', fontWeight: 500 }}>{s.label}</span>
            <div style={{ height: '20px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(s.recompute, 100)}%`, background: s.reColor, borderRadius: '3px', transition: 'width 0.3s ease', opacity: s.recompute > 0 ? 0.7 : 0 }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#7A8B7C', textAlign: 'right' }}>{s.recompute.toFixed(0)}%</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Memory Saved</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#3D5240' }}>{calc.memorySavings.toFixed(0)}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Compute Cost</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>+{calc.computeOverhead.toFixed(0)}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Checkpoints</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>{Math.floor(numLayers / checkpointEvery)}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Optimal sqrt(N)</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#8BA888' }}>{calc.optimal.sqrtN}</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#3D524010', borderRadius: '6px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        <strong>Key insight:</strong> The optimal checkpoint interval is sqrt({numLayers}) = {calc.optimal.sqrtN} layers. This minimizes the product of memory and recomputation cost. At this setting, memory scales as O(sqrt(N)) instead of O(N), with roughly 33% compute overhead.
      </div>
    </div>
  );
}
