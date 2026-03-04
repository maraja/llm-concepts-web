import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

// Chinchilla scaling: N_opt ~ C^0.50, D_opt ~ C^0.50
// Kaplan scaling: N_opt ~ C^0.73, D_opt ~ C^0.27
const chinchillaOptimal = (computeFLOPs: number) => {
  const N = 0.2743 * Math.pow(computeFLOPs, 0.50); // params
  const D = computeFLOPs / (6 * N); // tokens (approx C = 6ND)
  return { N, D };
};

const kaplanOptimal = (computeFLOPs: number) => {
  const N = 0.076 * Math.pow(computeFLOPs, 0.73);
  const D = computeFLOPs / (6 * N);
  return { N, D };
};

const formatNumber = (n: number, unit: 'params' | 'tokens' | 'flops'): string => {
  if (unit === 'flops') {
    if (n >= 1e24) return `${(n / 1e24).toFixed(1)}e24`;
    if (n >= 1e21) return `${(n / 1e21).toFixed(1)}e21`;
    if (n >= 1e18) return `${(n / 1e18).toFixed(1)}e18`;
    return `${(n / 1e15).toFixed(1)}e15`;
  }
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return `${(n / 1e3).toFixed(1)}K`;
};

// Known models for reference
const KNOWN_MODELS = [
  { name: 'GPT-3', params: 175e9, tokens: 300e9, compute: 3.1e23 },
  { name: 'Chinchilla', params: 70e9, tokens: 1.4e12, compute: 5.8e23 },
  { name: 'LLaMA 2-70B', params: 70e9, tokens: 2e12, compute: 8.4e23 },
  { name: 'LLaMA 3-8B', params: 8e9, tokens: 15e12, compute: 7.2e23 },
];

export default function ScalingLawCalculator() {
  // Compute budget as log10(FLOPs), range from 1e18 to 1e26
  const [computeLog, setComputeLog] = useState(23); // 1e23 FLOPs

  const computeFLOPs = Math.pow(10, computeLog);

  const chinchilla = useMemo(() => chinchillaOptimal(computeFLOPs), [computeFLOPs]);
  const kaplan = useMemo(() => kaplanOptimal(computeFLOPs), [computeFLOPs]);

  // Token-to-param ratio
  const chinchillaRatio = chinchilla.D / chinchilla.N;
  const kaplanRatio = kaplan.D / kaplan.N;

  // Estimated loss (Chinchilla scaling law): L(C) ~ (C_0/C)^alpha
  const estimatedLoss = useMemo(() => {
    return 1.69 * Math.pow(computeFLOPs / 1e18, -0.048);
  }, [computeFLOPs]);

  // SVG chart: N_opt and D_opt vs compute
  const chartW = 400;
  const chartH = 160;
  const padL = 45;
  const padR = 10;
  const padT = 15;
  const padB = 25;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const logToX = (logC: number) => padL + ((logC - 18) / 8) * plotW;
  const logParamsToY = (logN: number) => padT + plotH * (1 - (logN - 7) / 6);

  const chinchillaPath = useMemo(() => {
    const points: string[] = [];
    for (let lc = 18; lc <= 26; lc += 0.2) {
      const c = Math.pow(10, lc);
      const { N } = chinchillaOptimal(c);
      const x = logToX(lc);
      const y = logParamsToY(Math.log10(N));
      points.push(`${points.length === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  }, []);

  const kaplanPath = useMemo(() => {
    const points: string[] = [];
    for (let lc = 18; lc <= 26; lc += 0.2) {
      const c = Math.pow(10, lc);
      const { N } = kaplanOptimal(c);
      const x = logToX(lc);
      const y = logParamsToY(Math.log10(N));
      points.push(`${points.length === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  }, []);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Scaling Law Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Given a compute budget (FLOPs), calculate the optimal model size and token count under Chinchilla vs. Kaplan scaling laws.
        </p>
      </div>

      {/* Compute budget slider */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Compute budget (FLOPs)</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>
            10^{computeLog.toFixed(1)} ({formatNumber(computeFLOPs, 'flops')})
          </span>
        </div>
        <input type="range" min={18} max={26} step={0.1} value={computeLog}
          onChange={e => setComputeLog(parseFloat(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.15rem' }}>
          <span>10^18 (small)</span>
          <span>10^26 (frontier)</span>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Chinchilla */}
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8BA888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Chinchilla (2022)
          </div>
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Optimal Parameters</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>
                {formatNumber(chinchilla.N, 'params')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Optimal Tokens</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>
                {formatNumber(chinchilla.D, 'tokens')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Token/Param Ratio</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: '#D4A843' }}>
                {chinchillaRatio.toFixed(1)}:1
              </div>
            </div>
          </div>
        </div>

        {/* Kaplan */}
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C76B4A', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Kaplan (2020)
          </div>
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Optimal Parameters</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>
                {formatNumber(kaplan.N, 'params')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Optimal Tokens</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>
                {formatNumber(kaplan.D, 'tokens')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>Token/Param Ratio</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: '#D4A843' }}>
                {kaplanRatio.toFixed(1)}:1
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimal params vs compute chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>
          Optimal model size (N) vs. compute budget
        </div>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
          {/* Grid */}
          {[18, 20, 22, 24, 26].map(lc => (
            <g key={lc}>
              <line x1={logToX(lc)} x2={logToX(lc)} y1={padT} y2={padT + plotH} stroke="#E5DFD340" strokeWidth={1} />
              <text x={logToX(lc)} y={chartH - 5} textAnchor="middle"
                style={{ fontSize: '7px', fill: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace" }}>
                10^{lc}
              </text>
            </g>
          ))}
          {[8, 9, 10, 11, 12].map(ln => (
            <g key={ln}>
              <line x1={padL} x2={padL + plotW} y1={logParamsToY(ln)} y2={logParamsToY(ln)} stroke="#E5DFD340" strokeWidth={1} />
              <text x={padL - 5} y={logParamsToY(ln)} textAnchor="end" dominantBaseline="middle"
                style={{ fontSize: '7px', fill: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace" }}>
                10^{ln}
              </text>
            </g>
          ))}
          {/* Kaplan curve */}
          <path d={kaplanPath} fill="none" stroke="#C76B4A" strokeWidth={2} strokeDasharray="4,3" />
          {/* Chinchilla curve */}
          <path d={chinchillaPath} fill="none" stroke="#8BA888" strokeWidth={2} />
          {/* Current compute marker on Chinchilla */}
          <circle cx={logToX(computeLog)} cy={logParamsToY(Math.log10(chinchilla.N))} r={5} fill="#8BA888" stroke="#FDFBF7" strokeWidth={2} />
          {/* Current compute marker on Kaplan */}
          <circle cx={logToX(computeLog)} cy={logParamsToY(Math.log10(kaplan.N))} r={5} fill="#C76B4A" stroke="#FDFBF7" strokeWidth={2} />
          {/* Vertical line at current compute */}
          <line x1={logToX(computeLog)} x2={logToX(computeLog)} y1={padT} y2={padT + plotH} stroke="#2C3E2D" strokeWidth={1} strokeDasharray="3,3" opacity={0.3} />
          {/* Known models */}
          {KNOWN_MODELS.map(m => {
            const lc = Math.log10(m.compute);
            const ln = Math.log10(m.params);
            if (lc < 18 || lc > 26 || ln < 7 || ln > 13) return null;
            return (
              <g key={m.name}>
                <circle cx={logToX(lc)} cy={logParamsToY(ln)} r={3} fill="#D4A843" stroke="#FDFBF7" strokeWidth={1} />
                <text x={logToX(lc) + 5} y={logParamsToY(ln) - 5}
                  style={{ fontSize: '7px', fill: '#5A6B5C', fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
                  {m.name}
                </text>
              </g>
            );
          })}
          {/* Legend */}
          <line x1={padL + 5} x2={padL + 20} y1={padT + 5} y2={padT + 5} stroke="#8BA888" strokeWidth={2} />
          <text x={padL + 23} y={padT + 5} dominantBaseline="middle" style={{ fontSize: '7px', fill: '#5A6B5C' }}>Chinchilla</text>
          <line x1={padL + 5} x2={padL + 20} y1={padT + 15} y2={padT + 15} stroke="#C76B4A" strokeWidth={2} strokeDasharray="4,3" />
          <text x={padL + 23} y={padT + 15} dominantBaseline="middle" style={{ fontSize: '7px', fill: '#5A6B5C' }}>Kaplan</text>
        </svg>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Est. Loss</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>{estimatedLoss.toFixed(3)}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Chinchilla Ratio</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#3D5240' }}>~20:1</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Key Difference</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>N vs D</div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> Kaplan et al. (2020) recommended larger models trained on fewer tokens (N ~ C^0.73). Chinchilla (2022) showed this was suboptimal: both N and D should scale equally with compute (N ~ C^0.5, D ~ C^0.5), yielding a ~20:1 token-to-parameter ratio. Most modern models now follow Chinchilla-like or even data-richer ratios.
      </div>
    </div>
  );
}
