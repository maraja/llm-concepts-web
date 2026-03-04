import { useState, useMemo, Fragment } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const EXPERT_COLORS = [
  '#5B8DB8', '#C76B4A', '#8BA888', '#D4A843',
  '#9B6B8E', '#6B9B8E', '#B88B5B', '#7B8DB8',
];

export default function ExpertRoutingVisualizer() {
  const [numExperts, setNumExperts] = useState(8);
  const [epDegree, setEpDegree] = useState(4);
  const [tokensPerBatch, setTokensPerBatch] = useState(32);
  const [animStep, setAnimStep] = useState(0);

  const routing = useMemo(() => {
    const expertsPerGPU = Math.ceil(numExperts / epDegree);
    const tokensPerGPU = Math.ceil(tokensPerBatch / epDegree);

    // Simulate routing: each token is assigned to an expert with some skew
    // Popular experts get more tokens (Zipf-like distribution)
    const tokenAssignments: { tokenId: number; sourceGPU: number; expertId: number; destGPU: number }[] = [];
    const expertLoads = new Array(numExperts).fill(0);

    for (let t = 0; t < tokensPerBatch; t++) {
      const sourceGPU = Math.floor(t / tokensPerGPU);
      // Zipf-like: bias toward lower-numbered experts
      const r = Math.random();
      const skewedIdx = Math.floor(Math.pow(r, 1.5) * numExperts);
      const expertId = Math.min(skewedIdx, numExperts - 1);
      const destGPU = Math.floor(expertId / expertsPerGPU);
      tokenAssignments.push({ tokenId: t, sourceGPU: Math.min(sourceGPU, epDegree - 1), expertId, destGPU: Math.min(destGPU, epDegree - 1) });
      expertLoads[expertId]++;
    }

    // Communication matrix: how many tokens move from GPU i to GPU j
    const commMatrix: number[][] = Array.from({ length: epDegree }, () => new Array(epDegree).fill(0));
    let localTokens = 0;
    let remoteTokens = 0;

    tokenAssignments.forEach(ta => {
      commMatrix[ta.sourceGPU][ta.destGPU]++;
      if (ta.sourceGPU === ta.destGPU) localTokens++;
      else remoteTokens++;
    });

    // Load imbalance
    const maxLoad = Math.max(...expertLoads);
    const minLoad = Math.min(...expertLoads);
    const avgLoad = tokensPerBatch / numExperts;
    const imbalance = maxLoad > 0 ? (maxLoad - minLoad) / avgLoad : 0;

    // Communication volume: tokens * hidden_dim * 2 (dispatch + combine)
    const hiddenDim = 4096;
    const commVolumeGB = (remoteTokens * hiddenDim * 2 * 2) / 1e9; // *2 for FP16, *2 for dispatch+combine

    return {
      expertsPerGPU,
      tokensPerGPU,
      tokenAssignments,
      expertLoads,
      commMatrix,
      localTokens,
      remoteTokens,
      imbalance,
      commVolumeGB,
      maxLoad,
      avgLoad,
    };
  }, [numExperts, epDegree, tokensPerBatch]);

  // Animation steps: 0=source, 1=dispatch, 2=compute, 3=combine
  const stepLabels = ['Tokens on source GPUs', 'All-to-All dispatch', 'Expert computation', 'All-to-All combine'];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Expert Routing Visualizer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Visualize all-to-all token routing across expert-parallel GPUs. Tokens are dispatched to the GPU hosting their assigned expert, then results are sent back.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Number of Experts', value: numExperts, set: setNumExperts, min: 8, max: 64, step: 8, fmt: (v: number) => String(v) },
          { label: 'Expert Parallel Degree', value: epDegree, set: setEpDegree, min: 2, max: 8, step: 1, fmt: (v: number) => `${v} GPUs` },
          { label: 'Tokens per Batch', value: tokensPerBatch, set: setTokensPerBatch, min: 8, max: 128, step: 8, fmt: (v: number) => String(v) },
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

      {/* Animation step control */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Communication Phase</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{stepLabels[animStep]}</span>
        </div>
        <input type="range" min={0} max={3} step={1} value={animStep}
          onChange={e => setAnimStep(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#7A8B7C' }}>
          {stepLabels.map((s, i) => <span key={i}>{i === animStep ? s : ''}</span>)}
        </div>
      </div>

      {/* Communication matrix (all-to-all) */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          ALL-TO-ALL COMMUNICATION MATRIX (tokens from source GPU to destination GPU)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${epDegree}, 1fr)`, gap: '2px', marginBottom: '0.5rem' }}>
          {/* Header */}
          <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }} />
          {Array.from({ length: epDegree }, (_, j) => (
            <div key={j} style={{ textAlign: 'center', fontSize: '0.55rem', color: '#5A6B5C', fontWeight: 600, padding: '0.15rem' }}>
              Dest {j}
            </div>
          ))}
          {/* Rows */}
          {Array.from({ length: epDegree }, (_, i) => (
            <Fragment key={`row-${i}`}>
              <div style={{ fontSize: '0.55rem', color: '#5A6B5C', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' }}>
                Src {i}
              </div>
              {Array.from({ length: epDegree }, (_, j) => {
                const val = routing.commMatrix[i]?.[j] || 0;
                const maxVal = Math.max(...routing.commMatrix.flat());
                const intensity = maxVal > 0 ? val / maxVal : 0;
                const isLocal = i === j;
                const isActive = animStep === 1 || animStep === 3;
                return (
                  <div key={`${i}-${j}`} style={{
                    background: isLocal
                      ? `rgba(139, 168, 136, ${0.2 + intensity * 0.6})`
                      : `rgba(199, 107, 74, ${0.1 + intensity * 0.7})`,
                    borderRadius: '3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.25rem',
                    border: isActive && val > 0 && !isLocal ? '1px solid #C76B4A' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    opacity: isActive || animStep === 0 ? 1 : 0.4,
                  }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', fontWeight: 600, color: isLocal ? '#3D5240' : '#C76B4A' }}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.55rem', color: '#7A8B7C' }}>
          <span>Diagonal = local tokens (no communication needed)</span>
          <span>Off-diagonal = tokens requiring network transfer</span>
        </div>
      </div>

      {/* Expert load distribution */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          EXPERT LOAD DISTRIBUTION
        </div>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '80px' }}>
          {routing.expertLoads.slice(0, numExperts).map((load, i) => {
            const barH = routing.maxLoad > 0 ? (load / routing.maxLoad) * 100 : 0;
            const gpuIdx = Math.floor(i / routing.expertsPerGPU);
            const isOverloaded = load > routing.avgLoad * 1.5;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <span style={{ fontSize: '0.4rem', color: '#7A8B7C', marginBottom: '1px' }}>
                  {load}
                </span>
                <div style={{
                  width: '100%',
                  height: `${barH}%`,
                  background: isOverloaded ? '#C76B4A' : EXPERT_COLORS[gpuIdx % EXPERT_COLORS.length],
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.3s ease',
                  minHeight: '2px',
                  opacity: animStep >= 2 ? 1 : 0.4,
                }} />
                <div style={{ fontSize: '0.4rem', color: '#7A8B7C', marginTop: '2px' }}>E{i}</div>
              </div>
            );
          })}
        </div>
        {/* Average line indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#D4A843' }} />
          <span style={{ fontSize: '0.5rem', color: '#D4A843', fontWeight: 600 }}>avg: {routing.avgLoad.toFixed(1)} tokens</span>
          <div style={{ flex: 1, height: '1px', background: '#D4A843' }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Local Tokens</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#8BA888' }}>{routing.localTokens}</div>
          <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>{((routing.localTokens / tokensPerBatch) * 100).toFixed(0)}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Remote Tokens</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>{routing.remoteTokens}</div>
          <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>need all-to-all</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Imbalance</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: routing.imbalance > 1 ? '#C76B4A' : '#D4A843' }}>{routing.imbalance.toFixed(2)}x</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Comm Volume</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#5B8DB8' }}>
            {routing.commVolumeGB > 0.01 ? `${routing.commVolumeGB.toFixed(3)}GB` : '<0.01GB'}
          </div>
        </div>
      </div>

      {/* Experts per GPU info */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>Expert Placement</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Array.from({ length: epDegree }, (_, g) => {
            const startExpert = g * routing.expertsPerGPU;
            const endExpert = Math.min(startExpert + routing.expertsPerGPU - 1, numExperts - 1);
            return (
              <span key={g} style={{ fontSize: '0.58rem', color: '#5A6B5C', padding: '0.2rem 0.4rem', background: `${EXPERT_COLORS[g % EXPERT_COLORS.length]}15`, borderRadius: '4px', border: `1px solid ${EXPERT_COLORS[g % EXPERT_COLORS.length]}40` }}>
                <span style={{ fontWeight: 600 }}>GPU {g}</span>: E{startExpert}-E{endExpert}
              </span>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {routing.imbalance > 1.5
            ? `High load imbalance (${routing.imbalance.toFixed(1)}x) means some experts process far more tokens than others. The busiest expert handles ${routing.maxLoad} tokens while the average is ${routing.avgLoad.toFixed(1)}. This causes some GPUs to become bottlenecks. Expert parallelism requires auxiliary load balancing losses to mitigate this skew.`
            : `With ${numExperts} experts split across ${epDegree} GPUs (${routing.expertsPerGPU} experts/GPU), ${((routing.remoteTokens / tokensPerBatch) * 100).toFixed(0)}% of tokens require cross-GPU communication via all-to-all collectives. The dispatch phase sends tokens to expert GPUs; the combine phase returns results. This communication happens twice per MoE layer and is the primary overhead of expert parallelism.`}
        </div>
      </div>
    </div>
  );
}
