import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

// Loss model: L(N, D) = (N_c/N)^alpha_N + (D_c/D)^alpha_D + L_inf
// Using Chinchilla-style parametric loss
const computeLoss = (N: number, D: number): number => {
  const Nc = 4.06e8;
  const alphaN = 0.34;
  const Dc = 5.31e13;
  const alphaD = 0.28;
  const Linf = 1.61;
  return Math.pow(Nc / N, alphaN) + Math.pow(Dc / D, alphaD) + Linf;
};

const KNOWN_MODELS = [
  { name: 'GPT-2', N: 1.5e9, D: 40e9, color: '#7A8B7C' },
  { name: 'GPT-3', N: 175e9, D: 300e9, color: '#C76B4A' },
  { name: 'Chinchilla', N: 70e9, D: 1.4e12, color: '#8BA888' },
  { name: 'LLaMA-7B', N: 7e9, D: 1e12, color: '#D4A843' },
  { name: 'LLaMA 2-70B', N: 70e9, D: 2e12, color: '#6E8B6B' },
];

const formatNum = (n: number): string => {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  return `${(n / 1e3).toFixed(0)}K`;
};

export default function ComputeOptimalPlot() {
  const [computeSlider, setComputeSlider] = useState(50); // 0-100, maps to 1e19 - 1e25
  const [showIsoLoss, setShowIsoLoss] = useState(true);

  const computeLog = 19 + (computeSlider / 100) * 6;
  const computeFLOPs = Math.pow(10, computeLog);

  // Optimal N and D for this compute (Chinchilla: N ~ C^0.5)
  const optN = useMemo(() => 0.2743 * Math.pow(computeFLOPs, 0.50), [computeFLOPs]);
  const optD = useMemo(() => computeFLOPs / (6 * optN), [computeFLOPs, optN]);
  const optLoss = useMemo(() => computeLoss(optN, optD), [optN, optD]);

  // Chart dimensions
  const chartW = 400;
  const chartH = 260;
  const padL = 50;
  const padR = 15;
  const padT = 15;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  // Log scales: N from 1e7 to 1e12, D from 1e9 to 1e13
  const logNMin = 7, logNMax = 12;
  const logDMin = 9, logDMax = 13;

  const nToX = (logN: number) => padL + ((logN - logNMin) / (logNMax - logNMin)) * plotW;
  const dToY = (logD: number) => padT + plotH * (1 - (logD - logDMin) / (logDMax - logDMin));

  // Generate iso-loss contours
  const isoLossContours = useMemo(() => {
    const levels = [2.0, 2.2, 2.5, 3.0, 3.5];
    return levels.map(targetLoss => {
      const points: { x: number; y: number }[] = [];
      // For each N, find D that gives the target loss
      for (let logN = logNMin; logN <= logNMax; logN += 0.1) {
        const N = Math.pow(10, logN);
        // Binary search for D
        let lo = 1e8, hi = 1e14;
        for (let iter = 0; iter < 50; iter++) {
          const mid = Math.sqrt(lo * hi);
          const l = computeLoss(N, mid);
          if (l < targetLoss) hi = mid;
          else lo = mid;
        }
        const D = Math.sqrt(lo * hi);
        const logD = Math.log10(D);
        if (logD >= logDMin && logD <= logDMax) {
          points.push({ x: nToX(logN), y: dToY(logD) });
        }
      }
      return { loss: targetLoss, points };
    });
  }, []);

  // Compute-optimal frontier line
  const frontierPath = useMemo(() => {
    const points: string[] = [];
    for (let lc = 19; lc <= 25; lc += 0.1) {
      const C = Math.pow(10, lc);
      const N = 0.2743 * Math.pow(C, 0.50);
      const D = C / (6 * N);
      const logN = Math.log10(N);
      const logD = Math.log10(D);
      if (logN >= logNMin && logN <= logNMax && logD >= logDMin && logD <= logDMax) {
        points.push(`${points.length === 0 ? 'M' : 'L'} ${nToX(logN)} ${dToY(logD)}`);
      }
    }
    return points.join(' ');
  }, []);

  // Iso-compute line (C = 6ND => D = C/(6N))
  const isoComputePath = useMemo(() => {
    const points: string[] = [];
    for (let logN = logNMin; logN <= logNMax; logN += 0.1) {
      const N = Math.pow(10, logN);
      const D = computeFLOPs / (6 * N);
      const logD = Math.log10(D);
      if (logD >= logDMin && logD <= logDMax) {
        points.push(`${points.length === 0 ? 'M' : 'L'} ${nToX(logN)} ${dToY(logD)}`);
      }
    }
    return points.join(' ');
  }, [computeFLOPs]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Compute-Optimal Frontier
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Visualize the power-law relationship between model size (N), training data (D), and loss. The green line traces the compute-optimal allocation.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Compute budget</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>
              10^{computeLog.toFixed(1)} FLOPs
            </span>
          </div>
          <input type="range" min={0} max={100} step={1} value={computeSlider}
            onChange={e => setComputeSlider(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <button onClick={() => setShowIsoLoss(!showIsoLoss)} style={{
          padding: '0.35rem 0.65rem', borderRadius: '5px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
          border: `1px solid ${showIsoLoss ? '#D4A843' : '#E5DFD3'}`,
          background: showIsoLoss ? 'rgba(212, 168, 67, 0.06)' : 'transparent',
          color: showIsoLoss ? '#D4A843' : '#5A6B5C',
          fontWeight: showIsoLoss ? 600 : 400,
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          {showIsoLoss ? 'Hide' : 'Show'} Iso-Loss
        </button>
      </div>

      {/* Main chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
          {/* Grid */}
          {[7, 8, 9, 10, 11, 12].map(ln => (
            <g key={`gn${ln}`}>
              <line x1={nToX(ln)} x2={nToX(ln)} y1={padT} y2={padT + plotH} stroke="#E5DFD320" strokeWidth={1} />
              <text x={nToX(ln)} y={chartH - 8} textAnchor="middle"
                style={{ fontSize: '7px', fill: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace" }}>
                10^{ln}
              </text>
            </g>
          ))}
          {[9, 10, 11, 12, 13].map(ld => (
            <g key={`gd${ld}`}>
              <line x1={padL} x2={padL + plotW} y1={dToY(ld)} y2={dToY(ld)} stroke="#E5DFD320" strokeWidth={1} />
              <text x={padL - 5} y={dToY(ld)} textAnchor="end" dominantBaseline="middle"
                style={{ fontSize: '7px', fill: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace" }}>
                10^{ld}
              </text>
            </g>
          ))}
          {/* Axis labels */}
          <text x={padL + plotW / 2} y={chartH - 0} textAnchor="middle"
            style={{ fontSize: '8px', fill: '#5A6B5C', fontWeight: 600 }}>
            Parameters (N)
          </text>
          <text x={12} y={padT + plotH / 2} textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(-90, 12, ${padT + plotH / 2})`}
            style={{ fontSize: '8px', fill: '#5A6B5C', fontWeight: 600 }}>
            Tokens (D)
          </text>

          {/* Iso-loss contours */}
          {showIsoLoss && isoLossContours.map(contour => {
            if (contour.points.length < 2) return null;
            const path = contour.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            return (
              <g key={contour.loss}>
                <path d={path} fill="none" stroke="#D4A843" strokeWidth={1} opacity={0.4} />
                {contour.points.length > 0 && (
                  <text x={contour.points[0].x + 3} y={contour.points[0].y - 4}
                    style={{ fontSize: '6px', fill: '#D4A843', fontFamily: "'JetBrains Mono', monospace" }}>
                    L={contour.loss}
                  </text>
                )}
              </g>
            );
          })}

          {/* Iso-compute line */}
          <path d={isoComputePath} fill="none" stroke="#C76B4A" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />

          {/* Compute-optimal frontier */}
          <path d={frontierPath} fill="none" stroke="#8BA888" strokeWidth={2.5} />

          {/* Current optimal point */}
          {Math.log10(optN) >= logNMin && Math.log10(optN) <= logNMax && Math.log10(optD) >= logDMin && Math.log10(optD) <= logDMax && (
            <circle cx={nToX(Math.log10(optN))} cy={dToY(Math.log10(optD))} r={6} fill="#8BA888" stroke="#FDFBF7" strokeWidth={2} />
          )}

          {/* Known models */}
          {KNOWN_MODELS.map(m => {
            const logN = Math.log10(m.N);
            const logD = Math.log10(m.D);
            if (logN < logNMin || logN > logNMax || logD < logDMin || logD > logDMax) return null;
            return (
              <g key={m.name}>
                <circle cx={nToX(logN)} cy={dToY(logD)} r={3.5} fill={m.color} stroke="#FDFBF7" strokeWidth={1} />
                <text x={nToX(logN) + 5} y={dToY(logD) - 5}
                  style={{ fontSize: '7px', fill: '#2C3E2D', fontWeight: 600, fontFamily: "'Source Sans 3', sans-serif" }}>
                  {m.name}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <line x1={padL + plotW - 80} x2={padL + plotW - 65} y1={padT + 8} y2={padT + 8} stroke="#8BA888" strokeWidth={2.5} />
          <text x={padL + plotW - 62} y={padT + 8} dominantBaseline="middle" style={{ fontSize: '7px', fill: '#5A6B5C' }}>Optimal</text>
          <line x1={padL + plotW - 80} x2={padL + plotW - 65} y1={padT + 18} y2={padT + 18} stroke="#C76B4A" strokeWidth={1.5} strokeDasharray="4,3" />
          <text x={padL + plotW - 62} y={padT + 18} dominantBaseline="middle" style={{ fontSize: '7px', fill: '#5A6B5C' }}>Budget</text>
        </svg>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.5rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Optimal N</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#3D5240' }}>{formatNum(optN)}</div>
        </div>
        <div style={{ padding: '0.5rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Optimal D</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#3D5240' }}>{formatNum(optD)}</div>
        </div>
        <div style={{ padding: '0.5rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Min Loss</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>{optLoss.toFixed(3)}</div>
        </div>
        <div style={{ padding: '0.5rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>D/N Ratio</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>{(optD / optN).toFixed(0)}:1</div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> The green frontier line traces the compute-optimal N/D allocation. Points above this line are data-rich (more tokens per param, like LLaMA), while points below are parameter-rich (like GPT-3). The dashed red line shows all N/D combinations for your chosen compute budget -- moving along it reveals the loss landscape.
      </div>
    </div>
  );
}
