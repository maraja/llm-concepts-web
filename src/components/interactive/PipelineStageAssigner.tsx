import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function PipelineStageAssigner() {
  const [totalLayers, setTotalLayers] = useState(32);
  const [numStages, setNumStages] = useState(4);
  const [hiddenDim, setHiddenDim] = useState(4096);

  const data = useMemo(() => {
    const layersPerStage = Math.floor(totalLayers / numStages);
    const remainder = totalLayers % numStages;

    // Assign layers to stages: distribute remainder to last stages
    const stages = Array.from({ length: numStages }, (_, i) => {
      const extra = i < remainder ? 1 : 0;
      const count = layersPerStage + extra;
      const startLayer = Array.from({ length: i }, (_, j) => layersPerStage + (j < remainder ? 1 : 0)).reduce((a, b) => a + b, 0);
      return {
        stageId: i,
        startLayer,
        endLayer: startLayer + count - 1,
        layerCount: count,
      };
    });

    // Memory per layer (approximate for a transformer layer):
    // Parameters: 12 * H^2 (attention: 4*H^2, MLP: 8*H^2) in FP16 = 12 * H^2 * 2 bytes
    const paramsPerLayer = 12 * hiddenDim * hiddenDim;
    const paramBytesPerLayer = paramsPerLayer * 2; // FP16
    // Optimizer states: 2x FP32 copies = 12 * H^2 * 4 * 2
    const optimizerBytesPerLayer = paramsPerLayer * 4 * 2;
    // Gradient: same as params
    const gradientBytesPerLayer = paramBytesPerLayer;
    const memoryPerLayerGB = (paramBytesPerLayer + optimizerBytesPerLayer + gradientBytesPerLayer) / 1e9;

    // Activation memory at each stage boundary
    // Activations per layer: seq_len * hidden_dim * batch_size * bytes
    // For pipeline, activation at boundary = saved activations for backward
    const seqLen = 2048;
    const microBatchSize = 4;
    const activationPerLayer = seqLen * hiddenDim * microBatchSize * 2; // FP16

    const stageData = stages.map(s => {
      const paramMemGB = s.layerCount * memoryPerLayerGB;
      const activMemGB = (s.layerCount * activationPerLayer) / 1e9;
      const totalMemGB = paramMemGB + activMemGB;
      return {
        ...s,
        paramMemGB,
        activMemGB,
        totalMemGB,
      };
    });

    // Memory imbalance
    const maxMem = Math.max(...stageData.map(s => s.totalMemGB));
    const minMem = Math.min(...stageData.map(s => s.totalMemGB));
    const imbalance = maxMem > 0 ? ((maxMem - minMem) / maxMem) * 100 : 0;

    // Activation memory at stage boundaries (for pipeline communication)
    const boundaryActivMemMB = (seqLen * hiddenDim * microBatchSize * 2) / 1e6;

    // Total model parameters
    const totalParams = totalLayers * paramsPerLayer;

    return {
      stages: stageData,
      memoryPerLayerGB,
      maxMem,
      minMem,
      imbalance,
      boundaryActivMemMB,
      totalParams,
      layersPerStage,
      remainder,
    };
  }, [totalLayers, numStages, hiddenDim]);

  const stageColors = ['#C76B4A', '#D4A843', '#8BA888', '#5B8DB8', '#9B7DB8', '#D48A9B', '#6BAAAA', '#B8965B'];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Pipeline Stage Assigner
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Assign transformer layers to pipeline stages. See memory distribution, balance, and activation sizes at stage boundaries.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Layers', value: totalLayers, set: setTotalLayers, min: 12, max: 96, step: 4, fmt: (v: number) => String(v) },
          { label: 'Pipeline Stages', value: numStages, set: setNumStages, min: 2, max: 8, step: 1, fmt: (v: number) => String(v) },
          { label: 'Hidden Dimension', value: hiddenDim, set: setHiddenDim, min: 1024, max: 12288, step: 1024, fmt: (v: number) => v.toLocaleString() },
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

      {/* Layer assignment visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          LAYER-TO-STAGE ASSIGNMENT
        </div>
        <div style={{ display: 'flex', gap: '2px', height: '32px', marginBottom: '0.5rem' }}>
          {Array.from({ length: totalLayers }, (_, i) => {
            const stageIdx = data.stages.findIndex(s => i >= s.startLayer && i <= s.endLayer);
            const color = stageColors[stageIdx % stageColors.length];
            return (
              <div key={i} style={{
                flex: 1,
                background: color,
                borderRadius: '2px',
                opacity: 0.8,
                minWidth: '2px',
                transition: 'all 0.2s ease',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#7A8B7C' }}>
          <span>Layer 0</span>
          <span>Layer {totalLayers - 1}</span>
        </div>
      </div>

      {/* Stage details */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          STAGE DETAILS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numStages, 4)}, 1fr)`, gap: '0.5rem' }}>
          {data.stages.map((s, i) => (
            <div key={i} style={{
              background: '#FDFBF7', borderRadius: '6px', padding: '0.5rem',
              borderTop: `3px solid ${stageColors[i % stageColors.length]}`,
            }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: stageColors[i % stageColors.length], marginBottom: '0.3rem' }}>
                GPU {i} (Stage {i})
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: '#2C3E2D', marginBottom: '0.15rem' }}>
                Layers {s.startLayer}-{s.endLayer}
              </div>
              <div style={{ fontSize: '0.52rem', color: '#7A8B7C' }}>
                {s.layerCount} layers
              </div>
              <div style={{ marginTop: '0.3rem' }}>
                {/* Memory bar */}
                <div style={{ height: '8px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.15rem' }}>
                  <div style={{
                    width: `${data.maxMem > 0 ? (s.totalMemGB / data.maxMem) * 100 : 0}%`,
                    height: '100%',
                    background: stageColors[i % stageColors.length],
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem', color: '#5A6B5C' }}>
                  {s.totalMemGB.toFixed(1)} GB
                </div>
              </div>
            </div>
          ))}
        </div>
        {numStages > 4 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numStages - 4}, 1fr)`, gap: '0.5rem', marginTop: '0.5rem' }}>
            {data.stages.slice(4).map((s, idx) => {
              const i = idx + 4;
              return (
                <div key={i} style={{
                  background: '#FDFBF7', borderRadius: '6px', padding: '0.5rem',
                  borderTop: `3px solid ${stageColors[i % stageColors.length]}`,
                }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: stageColors[i % stageColors.length], marginBottom: '0.3rem' }}>
                    GPU {i} (Stage {i})
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: '#2C3E2D', marginBottom: '0.15rem' }}>
                    Layers {s.startLayer}-{s.endLayer}
                  </div>
                  <div style={{ fontSize: '0.52rem', color: '#7A8B7C' }}>
                    {s.layerCount} layers
                  </div>
                  <div style={{ marginTop: '0.3rem' }}>
                    <div style={{ height: '8px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.15rem' }}>
                      <div style={{
                        width: `${data.maxMem > 0 ? (s.totalMemGB / data.maxMem) * 100 : 0}%`,
                        height: '100%',
                        background: stageColors[i % stageColors.length],
                        borderRadius: '3px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem', color: '#5A6B5C' }}>
                      {s.totalMemGB.toFixed(1)} GB
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Memory breakdown */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          MEMORY PER STAGE (PARAMETERS + ACTIVATIONS)
        </div>
        {data.stages.map((s, i) => (
          <div key={i} style={{ marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#2C3E2D' }}>Stage {i} ({s.layerCount} layers)</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: stageColors[i % stageColors.length], fontWeight: 600 }}>
                {s.totalMemGB.toFixed(2)} GB
              </span>
            </div>
            <div style={{ display: 'flex', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${(s.paramMemGB / s.totalMemGB) * 100}%`,
                background: stageColors[i % stageColors.length],
                opacity: 0.9,
                transition: 'width 0.3s ease',
              }} />
              <div style={{
                width: `${(s.activMemGB / s.totalMemGB) * 100}%`,
                background: stageColors[i % stageColors.length],
                opacity: 0.5,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#8BA888', opacity: 0.9 }} />
            <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Params + Optimizer + Gradients</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#8BA888', opacity: 0.5 }} />
            <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Activations</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Layers / Stage</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {data.layersPerStage}{data.remainder > 0 ? ` (+${data.remainder})` : ''}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Imbalance</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: data.imbalance > 10 ? '#C76B4A' : '#8BA888' }}>
            {data.imbalance.toFixed(1)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Boundary Act.</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {data.boundaryActivMemMB.toFixed(0)} MB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total Params</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#5B8DB8' }}>
            {(data.totalParams / 1e9).toFixed(1)}B
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {data.remainder > 0
            ? `${totalLayers} layers do not divide evenly into ${numStages} stages. ${data.remainder} stage(s) get an extra layer, creating ${data.imbalance.toFixed(1)}% memory imbalance. The slowest stage determines pipeline throughput, so imbalance directly reduces efficiency. Choose layer counts divisible by the number of stages when possible.`
            : `${totalLayers} layers divide evenly into ${numStages} stages of ${data.layersPerStage} layers each. Each stage boundary requires ${data.boundaryActivMemMB.toFixed(0)} MB to transfer activations between GPUs. With ${(data.totalParams / 1e9).toFixed(1)}B total parameters, each GPU only stores ${(data.totalParams / numStages / 1e9).toFixed(2)}B parameters.`}
        </div>
      </div>
    </div>
  );
}
