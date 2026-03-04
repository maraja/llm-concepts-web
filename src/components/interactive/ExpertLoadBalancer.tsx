import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function ExpertLoadBalancer() {
  const [numExperts, setNumExperts] = useState(8);
  const [auxLossWeight, setAuxLossWeight] = useState(0.01);
  const [capacityFactor, setCapacityFactor] = useState(1.25);
  const [enableBalancing, setEnableBalancing] = useState(true);

  const metrics = useMemo(() => {
    const totalTokens = 256;
    const idealLoad = totalTokens / numExperts;
    const capacity = Math.floor(idealLoad * capacityFactor);

    // Simulate unbalanced routing (Zipf-like distribution)
    // Without balancing: sharp skew; With balancing: reduced skew based on aux loss weight
    const unbalancedLoads: number[] = [];
    let remaining = totalTokens;
    for (let i = 0; i < numExperts; i++) {
      if (i === numExperts - 1) {
        unbalancedLoads.push(remaining);
      } else {
        // Zipf distribution: expert i gets proportional to 1/(i+1)^0.8
        const harmonic = Array.from({ length: numExperts }, (_, k) => 1 / Math.pow(k + 1, 0.8)).reduce((a, b) => a + b, 0);
        const share = (1 / Math.pow(i + 1, 0.8)) / harmonic;
        const tokens = Math.round(totalTokens * share);
        unbalancedLoads.push(Math.min(tokens, remaining));
        remaining -= Math.min(tokens, remaining);
      }
    }

    // Balanced loads: interpolate between uniform and unbalanced based on aux_loss strength
    const balanceFactor = enableBalancing ? Math.min(auxLossWeight * 50, 0.95) : 0; // How much we flatten
    const balancedLoads = unbalancedLoads.map(load => {
      const balanced = idealLoad + (load - idealLoad) * (1 - balanceFactor);
      return Math.round(balanced);
    });

    // Ensure total matches
    const balancedSum = balancedLoads.reduce((a, b) => a + b, 0);
    if (balancedSum !== totalTokens && balancedLoads.length > 0) {
      balancedLoads[0] += totalTokens - balancedSum;
    }

    const activeLoads = enableBalancing ? balancedLoads : unbalancedLoads;

    // Calculate dropped tokens (exceeding capacity)
    const droppedPerExpert = activeLoads.map(load => Math.max(0, load - capacity));
    const totalDropped = droppedPerExpert.reduce((a, b) => a + b, 0);
    const processedPerExpert = activeLoads.map(load => Math.min(load, capacity));

    // Wasted compute: capacity allocated but not used
    const wastedPerExpert = processedPerExpert.map(load => capacity - load);
    const totalWasted = wastedPerExpert.reduce((a, b) => a + b, 0);
    const totalCapacity = capacity * numExperts;

    // Effective utilization
    const totalProcessed = processedPerExpert.reduce((a, b) => a + b, 0);
    const utilization = totalProcessed / totalCapacity;

    // Load imbalance metric (coefficient of variation)
    const mean = totalTokens / numExperts;
    const variance = activeLoads.reduce((sum, load) => sum + Math.pow(load - mean, 2), 0) / numExperts;
    const cv = Math.sqrt(variance) / mean;

    // Aux loss value
    const fractions = activeLoads.map(l => l / totalTokens);
    const routerProbs = fractions.map(() => 1 / numExperts); // simplified
    const auxLoss = numExperts * fractions.reduce((sum, f, i) => sum + f * routerProbs[i], 0);

    return {
      totalTokens,
      idealLoad,
      capacity,
      unbalancedLoads,
      balancedLoads,
      activeLoads,
      droppedPerExpert,
      totalDropped,
      processedPerExpert,
      wastedPerExpert,
      totalWasted,
      totalCapacity,
      utilization,
      cv,
      auxLoss,
      maxLoad: Math.max(...activeLoads),
    };
  }, [numExperts, auxLossWeight, capacityFactor, enableBalancing]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Expert Load Balancer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Explore how auxiliary loss and capacity factor affect token distribution across MoE experts. Without balancing, some experts are overwhelmed while others sit idle.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Number of Experts', value: numExperts, set: setNumExperts, min: 4, max: 32, step: 4, fmt: (v: number) => String(v) },
          { label: 'Aux Loss Weight', value: auxLossWeight, set: setAuxLossWeight, min: 0, max: 0.1, step: 0.005, fmt: (v: number) => v.toFixed(3) },
          { label: 'Capacity Factor', value: capacityFactor, set: setCapacityFactor, min: 1.0, max: 2.0, step: 0.05, fmt: (v: number) => `${v.toFixed(2)}x` },
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

      {/* Toggle for load balancing */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button onClick={() => setEnableBalancing(!enableBalancing)} style={{
          padding: '0.4rem 0.8rem', borderRadius: '6px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
          border: `1px solid ${enableBalancing ? '#8BA888' : '#C76B4A'}`,
          background: enableBalancing ? 'rgba(139, 168, 136, 0.1)' : 'rgba(199, 107, 74, 0.1)',
          color: enableBalancing ? '#3D5240' : '#C76B4A',
          fontWeight: 600, cursor: 'pointer',
        }}>
          {enableBalancing ? 'Load Balancing: ON' : 'Load Balancing: OFF'}
        </button>
      </div>

      {/* Bar chart: tokens per expert */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          TOKENS PER EXPERT (256 total tokens)
        </div>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '120px', marginBottom: '0.3rem' }}>
          {metrics.activeLoads.map((load, i) => {
            const maxBarH = Math.max(metrics.maxLoad, metrics.capacity);
            const barH = maxBarH > 0 ? (load / maxBarH) * 100 : 0;
            const capLine = maxBarH > 0 ? (metrics.capacity / maxBarH) * 100 : 0;
            const isOverCapacity = load > metrics.capacity;
            const isUnderutilized = load < metrics.idealLoad * 0.5;

            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                {/* Capacity line */}
                <div style={{
                  position: 'absolute',
                  bottom: `${capLine}%`,
                  width: '100%',
                  height: '1px',
                  background: '#D4A843',
                  zIndex: 1,
                }} />
                {/* Token count */}
                <span style={{ fontSize: '0.45rem', color: '#7A8B7C', marginBottom: '1px', fontFamily: "'JetBrains Mono', monospace" }}>
                  {load}
                </span>
                {/* Bar: processed portion */}
                <div style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  height: `${barH}%`,
                  transition: 'height 0.3s ease',
                }}>
                  {/* Dropped portion (above capacity) */}
                  {isOverCapacity && (
                    <div style={{
                      width: '100%',
                      flex: `${metrics.droppedPerExpert[i]} 0 0`,
                      background: '#C76B4A',
                      borderRadius: '2px 2px 0 0',
                      opacity: 0.5,
                    }} />
                  )}
                  {/* Processed portion */}
                  <div style={{
                    width: '100%',
                    flex: `${metrics.processedPerExpert[i]} 0 0`,
                    background: isOverCapacity ? '#C76B4A' : isUnderutilized ? '#7A8B7C' : '#8BA888',
                    borderRadius: isOverCapacity ? '0' : '2px 2px 0 0',
                  }} />
                </div>
                <div style={{ fontSize: '0.45rem', color: '#7A8B7C', marginTop: '2px' }}>E{i}</div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#8BA888' }} />
            <span style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>Within capacity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#C76B4A' }} />
            <span style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>Over capacity (dropped)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#7A8B7C' }} />
            <span style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>Underutilized</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '10px', height: '2px', background: '#D4A843' }} />
            <span style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>Capacity limit ({metrics.capacity} tokens)</span>
          </div>
        </div>
      </div>

      {/* Comparison: with vs without balancing */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          LOAD DISTRIBUTION COMPARISON
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Unbalanced */}
          <div>
            <div style={{ fontSize: '0.62rem', color: '#C76B4A', fontWeight: 600, marginBottom: '0.3rem' }}>Without balancing</div>
            <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '50px' }}>
              {metrics.unbalancedLoads.map((load, i) => {
                const maxL = Math.max(...metrics.unbalancedLoads);
                return (
                  <div key={i} style={{ flex: 1, height: `${maxL > 0 ? (load / maxL) * 100 : 0}%`, background: '#C76B4A', borderRadius: '1px 1px 0 0', minHeight: '1px', transition: 'height 0.3s ease', opacity: 0.7 }} />
                );
              })}
            </div>
          </div>
          {/* Balanced */}
          <div>
            <div style={{ fontSize: '0.62rem', color: '#8BA888', fontWeight: 600, marginBottom: '0.3rem' }}>With balancing (aux={auxLossWeight.toFixed(3)})</div>
            <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '50px' }}>
              {metrics.balancedLoads.map((load, i) => {
                const maxL = Math.max(...metrics.unbalancedLoads); // Same scale for comparison
                return (
                  <div key={i} style={{ flex: 1, height: `${maxL > 0 ? (load / maxL) * 100 : 0}%`, background: '#8BA888', borderRadius: '1px 1px 0 0', minHeight: '1px', transition: 'height 0.3s ease', opacity: 0.7 }} />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Dropped Tokens</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: metrics.totalDropped > 0 ? '#C76B4A' : '#8BA888' }}>
            {metrics.totalDropped}
          </div>
          <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>
            {((metrics.totalDropped / metrics.totalTokens) * 100).toFixed(1)}% lost
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Wasted Compute</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>
            {metrics.totalWasted}
          </div>
          <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>
            {((metrics.totalWasted / metrics.totalCapacity) * 100).toFixed(0)}% unused
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Utilization</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: metrics.utilization > 0.7 ? '#8BA888' : '#C76B4A' }}>
            {(metrics.utilization * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Load CV</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: metrics.cv > 0.3 ? '#C76B4A' : '#8BA888' }}>
            {metrics.cv.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>
            {metrics.cv < 0.15 ? 'well balanced' : metrics.cv < 0.3 ? 'moderate skew' : 'severe skew'}
          </div>
        </div>
      </div>

      {/* Capacity factor explanation */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>Capacity Factor Trade-off</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { cf: '1.0x', desc: 'No slack -- any imbalance causes drops' },
            { cf: '1.25x', desc: 'Standard -- 25% buffer (Switch Transformer)' },
            { cf: '1.5x', desc: 'Conservative -- fewer drops, more waste' },
            { cf: '2.0x', desc: 'Maximum buffer -- nearly no drops' },
          ].map(item => (
            <span key={item.cf} style={{ fontSize: '0.58rem', color: '#5A6B5C' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{item.cf}</span>: {item.desc}
            </span>
          ))}
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {!enableBalancing
            ? `Without load balancing, expert routing follows a natural Zipf-like distribution where popular experts receive far more tokens. With capacity factor ${capacityFactor.toFixed(2)}x, each expert can process at most ${metrics.capacity} tokens (${capacityFactor.toFixed(2)} times the ideal load of ${metrics.idealLoad.toFixed(0)}). This results in ${metrics.totalDropped} dropped tokens (${((metrics.totalDropped / metrics.totalTokens) * 100).toFixed(1)}% information loss).`
            : auxLossWeight < 0.005
            ? `Aux loss weight is very low (${auxLossWeight.toFixed(3)}), providing minimal balancing pressure. Increase it to better distribute tokens across experts. The trade-off: higher aux loss reduces model quality slightly but improves hardware utilization dramatically.`
            : `With aux loss weight ${auxLossWeight.toFixed(3)}, the router is encouraged to distribute tokens more evenly. The load coefficient of variation is ${metrics.cv.toFixed(2)} (${metrics.cv < 0.15 ? 'well balanced' : 'still skewed'}). Capacity factor ${capacityFactor.toFixed(2)}x allocates ${metrics.capacity} token slots per expert, wasting ${((metrics.totalWasted / metrics.totalCapacity) * 100).toFixed(0)}% of allocated compute but dropping only ${metrics.totalDropped} tokens.`}
        </div>
      </div>
    </div>
  );
}
