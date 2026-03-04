import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function ActivationMemoryVisualizer() {
  const [numLayers, setNumLayers] = useState(16);
  const [checkpointInterval, setCheckpointInterval] = useState(4);
  const [backwardStep, setBackwardStep] = useState(0);

  const layerData = useMemo(() => {
    const layers = Array.from({ length: numLayers }, (_, i) => {
      const isCheckpoint = i % checkpointInterval === 0 || i === numLayers - 1;
      return {
        index: i,
        isCheckpoint,
        status: 'stored' as 'stored' | 'recomputed' | 'checkpoint' | 'discarded',
      };
    });

    // Mark checkpoints
    layers.forEach(l => {
      if (l.isCheckpoint) l.status = 'checkpoint';
    });

    return layers;
  }, [numLayers, checkpointInterval]);

  // Simulate backward pass state
  const backwardState = useMemo(() => {
    const totalSegments = Math.ceil(numLayers / checkpointInterval);
    const maxSteps = totalSegments;

    const currentSegment = maxSteps - 1 - Math.min(backwardStep, maxSteps - 1);
    const segStart = currentSegment * checkpointInterval;
    const segEnd = Math.min(segStart + checkpointInterval, numLayers);

    const states = Array.from({ length: numLayers }, (_, i) => {
      const isCheckpoint = i % checkpointInterval === 0 || i === numLayers - 1;

      if (i >= segStart && i < segEnd) {
        // Current segment being processed
        if (isCheckpoint) return 'checkpoint' as const;
        return 'recomputed' as const;
      } else if (i < segStart) {
        // Not yet processed in backward (still stored at checkpoints)
        if (isCheckpoint) return 'checkpoint' as const;
        return 'discarded' as const;
      } else {
        // Already processed, freed
        return 'discarded' as const;
      }
    });

    // Count peak memory at this step
    const storedCount = states.filter(s => s === 'checkpoint' || s === 'recomputed').length;

    return { states, storedCount, currentSegment, segStart, segEnd };
  }, [numLayers, checkpointInterval, backwardStep]);

  const totalSegments = Math.ceil(numLayers / checkpointInterval);
  const numCheckpoints = layerData.filter(l => l.isCheckpoint).length;

  const statusColors: Record<string, string> = {
    checkpoint: '#5B8DB8',
    recomputed: '#7A8B7C',
    stored: '#8BA888',
    discarded: '#E5DFD3',
  };

  const statusLabels: Record<string, string> = {
    checkpoint: 'Checkpoint (saved)',
    recomputed: 'Recomputed on-the-fly',
    stored: 'Stored in memory',
    discarded: 'Freed / not needed',
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Activation Memory Visualizer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See which layer activations are stored, checkpointed, or recomputed during the backward pass.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Layers</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numLayers}</span>
          </div>
          <input type="range" min={8} max={32} step={1} value={numLayers}
            onChange={e => { setNumLayers(Number(e.target.value)); setBackwardStep(0); }}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Checkpoint Every</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{checkpointInterval}</span>
          </div>
          <input type="range" min={1} max={Math.min(numLayers, 16)} step={1} value={checkpointInterval}
            onChange={e => { setCheckpointInterval(Number(e.target.value)); setBackwardStep(0); }}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Backward Step</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{backwardStep}/{totalSegments - 1}</span>
          </div>
          <input type="range" min={0} max={Math.max(totalSegments - 1, 0)} step={1} value={backwardStep}
            onChange={e => setBackwardStep(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Layer activation grid */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>LAYER ACTIVATION STATUS (BACKWARD PASS)</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numLayers, 16)}, 1fr)`, gap: '3px', marginBottom: '0.5rem' }}>
          {backwardState.states.map((status, i) => (
            <div key={i} style={{
              aspectRatio: '1',
              background: statusColors[status],
              borderRadius: '3px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              border: i >= backwardState.segStart && i < backwardState.segEnd ? '2px solid #C76B4A' : '2px solid transparent',
              minHeight: '20px',
            }}>
              <span style={{ fontSize: numLayers > 20 ? '0.45rem' : '0.55rem', color: status === 'discarded' ? '#B0A898' : '#fff', fontWeight: 600 }}>
                {i}
              </span>
            </div>
          ))}
        </div>
        {numLayers > 16 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numLayers - 16, 16)}, 1fr)`, gap: '3px', marginBottom: '0.5rem' }}>
            {backwardState.states.slice(16).map((status, i) => (
              <div key={i + 16} style={{
                aspectRatio: '1',
                background: statusColors[status],
                borderRadius: '3px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
                border: (i + 16) >= backwardState.segStart && (i + 16) < backwardState.segEnd ? '2px solid #C76B4A' : '2px solid transparent',
                minHeight: '20px',
              }}>
                <span style={{ fontSize: numLayers > 20 ? '0.45rem' : '0.55rem', color: status === 'discarded' ? '#B0A898' : '#fff', fontWeight: 600 }}>
                  {i + 16}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {Object.entries(statusColors).map(([key, color]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
              <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{statusLabels[key]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Checkpoints</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#5B8DB8' }}>{numCheckpoints}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Peak Memory</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>{backwardState.storedCount}u</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>vs Full Store</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#3D5240' }}>{((1 - backwardState.storedCount / numLayers) * 100).toFixed(0)}% less</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Processing</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>Seg {backwardState.currentSegment + 1}</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#3D524010', borderRadius: '6px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        <strong>How it works:</strong> During the backward pass, only checkpoint activations are kept in memory. When gradients need non-checkpoint activations, those layers are recomputed from the nearest preceding checkpoint. Step through the backward pass to see which segment is being recomputed at each stage.
      </div>
    </div>
  );
}
