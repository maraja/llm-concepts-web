import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function AllReduceVisualizer() {
  const [numGPUs, setNumGPUs] = useState(4);
  const [step, setStep] = useState(0);

  const gpuColors = ['#C76B4A', '#D4A843', '#8BA888', '#5B8DB8', '#9B7DB8', '#D48A9B', '#6BAAAA', '#B8965B',
    '#7A8B7C', '#C7884A', '#4A8BC7', '#A8885B', '#8B5B9B', '#5B8B6B', '#C74A6B', '#6B8BC7'];

  const data = useMemo(() => {
    // Each GPU has a "gradient shard" represented by a value
    const gradients = Array.from({ length: numGPUs }, (_, i) => {
      const seed = (i + 1) * 17 % 100;
      return Math.round(seed * 10) / 10;
    });

    // All-reduce result: sum of all gradients divided by numGPUs (average)
    const sum = gradients.reduce((a, b) => a + b, 0);
    const average = Math.round((sum / numGPUs) * 10) / 10;

    // Communication volume: each GPU sends and receives (N-1)/N of its data
    // For ring all-reduce: 2 * (N-1) / N * dataSize
    const dataPerGPU_MB = 100; // assume 100MB gradient per GPU
    const commVolume = 2 * ((numGPUs - 1) / numGPUs) * dataPerGPU_MB;
    const totalBandwidth = commVolume * numGPUs;

    // Scaling efficiency (ring all-reduce is very efficient)
    const idealTime = 1;
    const commOverhead = (numGPUs - 1) / numGPUs * 0.15; // 15% of compute time for comm
    const actualTime = idealTime + commOverhead;
    const efficiency = idealTime / actualTime * 100;

    return { gradients, average, sum, commVolume, totalBandwidth, efficiency, dataPerGPU_MB };
  }, [numGPUs]);

  const stepLabels = [
    'Local Compute',
    'All-Reduce Communication',
    'Synchronized Update',
  ];

  const stepDescriptions = [
    'Each GPU computes gradients on its own data shard independently.',
    'GPUs exchange and aggregate gradients via ring all-reduce. Each GPU sends/receives to neighbors.',
    'All GPUs now hold identical averaged gradients. Weights are updated synchronously.',
  ];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          All-Reduce Visualizer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how gradients are synchronized across GPUs using the all-reduce collective operation in data-parallel training.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Number of GPUs</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numGPUs}</span>
          </div>
          <input type="range" min={2} max={16} step={1} value={numGPUs}
            onChange={e => setNumGPUs(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Step</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{stepLabels[step]}</span>
          </div>
          <input type="range" min={0} max={2} step={1} value={step}
            onChange={e => setStep(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Step description */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', fontWeight: 600, marginBottom: '0.25rem' }}>
          STEP {step + 1}: {stepLabels[step].toUpperCase()}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.5 }}>
          {stepDescriptions[step]}
        </div>
      </div>

      {/* GPU visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem', fontWeight: 600 }}>
          GPU GRADIENT STATE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numGPUs, 8)}, 1fr)`, gap: '0.5rem' }}>
          {Array.from({ length: numGPUs }, (_, i) => {
            const isActive = step === 0;
            const isCommunicating = step === 1;
            const isSynced = step === 2;
            const displayValue = isSynced ? data.average : data.gradients[i];
            const color = gpuColors[i % gpuColors.length];

            return (
              <div key={i} style={{
                background: '#FDFBF7',
                borderRadius: '8px',
                padding: '0.5rem',
                textAlign: 'center',
                border: isCommunicating ? `2px solid ${color}` : '2px solid transparent',
                transition: 'all 0.3s ease',
                opacity: 1,
              }}>
                <div style={{
                  fontSize: '0.6rem', fontWeight: 700, color: '#FDFBF7',
                  background: color, borderRadius: '4px',
                  padding: '0.15rem 0.3rem', marginBottom: '0.35rem',
                }}>
                  GPU {i}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: numGPUs > 8 ? '0.65rem' : '0.8rem',
                  fontWeight: 600,
                  color: isSynced ? '#8BA888' : '#C76B4A',
                  transition: 'color 0.3s ease',
                }}>
                  {displayValue.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.5rem', color: '#7A8B7C', marginTop: '0.15rem' }}>
                  {isActive ? 'local grad' : isCommunicating ? 'exchanging' : 'synced'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ring all-reduce arrows */}
        {step === 1 && (
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
              {Array.from({ length: numGPUs }, (_, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem', fontWeight: 600,
                    color: gpuColors[i % gpuColors.length],
                  }}>
                    G{i}
                  </span>
                  {i < numGPUs - 1 && (
                    <span style={{ color: '#C76B4A', fontSize: '0.7rem' }}>{'\u2194'}</span>
                  )}
                </span>
              ))}
              <span style={{ color: '#C76B4A', fontSize: '0.7rem' }}>{'\u2194'}</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.6rem', fontWeight: 600,
                color: gpuColors[0],
              }}>
                G0
              </span>
            </div>
            <div style={{ fontSize: '0.55rem', color: '#7A8B7C', marginTop: '0.3rem' }}>
              Ring topology: each GPU sends to next, receives from previous ({numGPUs - 1} rounds)
            </div>
          </div>
        )}
      </div>

      {/* Communication stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Comm / GPU</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {data.commVolume.toFixed(0)} MB
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Ring Rounds</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {2 * (numGPUs - 1)}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Efficiency</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {data.efficiency.toFixed(1)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Avg Gradient</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#5B8DB8' }}>
            {data.average.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Scaling efficiency bar */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          RING ALL-REDUCE SCALING
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.62rem', color: '#2C3E2D', minWidth: '55px' }}>Comm cost</span>
          <div style={{ flex: 1, height: '14px', background: 'rgba(229, 223, 211, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${((numGPUs - 1) / numGPUs) * 100}%`,
              height: '100%', background: '#D4A843', borderRadius: '4px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: '#D4A843', fontWeight: 600, minWidth: '35px' }}>
            {(((numGPUs - 1) / numGPUs) * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ fontSize: '0.55rem', color: '#7A8B7C', marginTop: '0.3rem' }}>
          Ring all-reduce transfers 2(N-1)/N of data per GPU -- nearly constant regardless of GPU count
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {numGPUs <= 4
            ? `With ${numGPUs} GPUs, ring all-reduce requires ${2 * (numGPUs - 1)} communication rounds. The bandwidth cost per GPU is 2(N-1)/N of the gradient size, which approaches 2x as N grows. This means communication overhead is nearly constant per GPU, making ring all-reduce highly scalable.`
            : `At ${numGPUs} GPUs, the communication volume per GPU (${data.commVolume.toFixed(0)} MB) is close to the maximum of 2x the gradient size (200 MB). Ring all-reduce achieves near-optimal bandwidth utilization because each GPU only communicates with its two neighbors, avoiding the bottleneck of a centralized parameter server.`}
        </div>
      </div>
    </div>
  );
}
