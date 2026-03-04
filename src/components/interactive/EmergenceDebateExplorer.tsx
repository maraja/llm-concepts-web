import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

// Underlying "true" performance: smooth sigmoid in log-space
// P(logN) = sigmoid((logN - threshold) * steepness)
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

const truePerformance = (logN: number): number => {
  // Smooth underlying capability
  return sigmoid((logN - 10.2) * 3.5);
};

// Exact-match metric (nonlinear transformation that creates apparent emergence)
const exactMatchMetric = (logN: number): number => {
  const p = truePerformance(logN);
  // Exact match on multi-token sequences: all tokens must be correct
  // If each token has probability p, exact match for k=5 tokens is p^k
  const k = 5;
  return Math.pow(p, k);
};

// Token-level accuracy (linear metric, shows gradual improvement)
const tokenAccuracyMetric = (logN: number): number => {
  return truePerformance(logN);
};

// Brier score (smooth, probabilistic metric)
const brierScoreMetric = (logN: number): number => {
  const p = truePerformance(logN);
  // Brier score = mean squared error of probabilistic predictions
  // Lower is better, so we'll show 1 - brierScore for visualization
  return 1 - (1 - p) * (1 - p);
};

type MetricType = 'exact_match' | 'token_accuracy' | 'brier_score';
type ViewMode = 'linear' | 'log';

const METRICS: { key: MetricType; label: string; color: string; fn: (logN: number) => number; description: string }[] = [
  { key: 'exact_match', label: 'Exact Match', color: '#C76B4A', fn: exactMatchMetric, description: 'All-or-nothing: entire answer must be exactly correct' },
  { key: 'token_accuracy', label: 'Token Accuracy', color: '#8BA888', fn: tokenAccuracyMetric, description: 'Per-token correctness, averaging over each position' },
  { key: 'brier_score', label: 'Brier Score', color: '#D4A843', fn: brierScoreMetric, description: 'Probabilistic calibration (1 - squared error)' },
];

export default function EmergenceDebateExplorer() {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['exact_match', 'token_accuracy']);
  const [viewMode, setViewMode] = useState<ViewMode>('linear');
  const [showAnnotations, setShowAnnotations] = useState(true);

  const toggleMetric = (key: MetricType) => {
    setSelectedMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Chart dimensions
  const chartW = 400;
  const chartH = 200;
  const padL = 40;
  const padR = 15;
  const padT = 15;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const logMin = 8, logMax = 12;

  const toX = (logN: number) => {
    if (viewMode === 'log') {
      return padL + ((logN - logMin) / (logMax - logMin)) * plotW;
    }
    // Linear scale: convert from log to linear params
    const nMin = Math.pow(10, logMin);
    const nMax = Math.pow(10, logMax);
    const n = Math.pow(10, logN);
    return padL + ((n - nMin) / (nMax - nMin)) * plotW;
  };

  const toY = (val: number) => padT + plotH * (1 - val);

  const generatePath = (fn: (logN: number) => number) => {
    const points: string[] = [];
    for (let logN = logMin; logN <= logMax; logN += 0.05) {
      const x = toX(logN);
      const y = toY(fn(logN));
      points.push(`${points.length === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  };

  const activeMetrics = useMemo(() =>
    METRICS.filter(m => selectedMetrics.includes(m.key)),
  [selectedMetrics]);

  const formatParams = (n: number): string => {
    if (n >= 1e12) return `${(n / 1e12).toFixed(0)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(0)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
    return `${(n / 1e3).toFixed(0)}K`;
  };

  // X-axis tick positions
  const xTicks = viewMode === 'log'
    ? [8, 9, 10, 11, 12]
    : [8, 10.3, 11, 11.5, 12]; // Spaced for linear view

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          The Emergence Debate
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Is emergence real or a metric artifact? Toggle between linear and log-scale metrics to see how the same underlying improvement can look like sudden emergence or gradual progress.
        </p>
      </div>

      {/* View mode toggle */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>X-axis scale:</span>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {[
            { key: 'log' as ViewMode, label: 'Log Scale' },
            { key: 'linear' as ViewMode, label: 'Linear Scale' },
          ].map(v => (
            <button key={v.key} onClick={() => setViewMode(v.key)} style={{
              padding: '0.3rem 0.6rem', borderRadius: '5px',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem',
              border: `1px solid ${viewMode === v.key ? '#C76B4A' : '#E5DFD3'}`,
              background: viewMode === v.key ? 'rgba(199, 107, 74, 0.06)' : 'transparent',
              color: viewMode === v.key ? '#C76B4A' : '#5A6B5C',
              fontWeight: viewMode === v.key ? 600 : 400,
              cursor: 'pointer',
            }}>
              {v.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAnnotations(!showAnnotations)} style={{
          padding: '0.3rem 0.6rem', borderRadius: '5px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem',
          border: `1px solid ${showAnnotations ? '#D4A843' : '#E5DFD3'}`,
          background: showAnnotations ? 'rgba(212, 168, 67, 0.06)' : 'transparent',
          color: showAnnotations ? '#D4A843' : '#5A6B5C',
          cursor: 'pointer', marginLeft: 'auto',
        }}>
          {showAnnotations ? 'Hide' : 'Show'} Notes
        </button>
      </div>

      {/* Metric toggles */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {METRICS.map(m => (
          <button key={m.key} onClick={() => toggleMetric(m.key)} style={{
            padding: '0.3rem 0.6rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem',
            border: `1px solid ${selectedMetrics.includes(m.key) ? m.color : '#E5DFD3'}`,
            background: selectedMetrics.includes(m.key) ? `${m.color}10` : 'transparent',
            color: selectedMetrics.includes(m.key) ? m.color : '#5A6B5C',
            fontWeight: selectedMetrics.includes(m.key) ? 600 : 400,
            cursor: 'pointer',
          }}>
            {selectedMetrics.includes(m.key) ? '\u2713 ' : ''}{m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>
          Performance vs. model scale ({viewMode === 'log' ? 'logarithmic' : 'linear'} x-axis)
        </div>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
          {/* Grid */}
          {xTicks.map(lp => (
            <g key={lp}>
              <line x1={toX(lp)} x2={toX(lp)} y1={padT} y2={padT + plotH} stroke="#E5DFD330" strokeWidth={1} />
              <text x={toX(lp)} y={chartH - 8} textAnchor="middle"
                style={{ fontSize: '7px', fill: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace" }}>
                {formatParams(Math.pow(10, lp))}
              </text>
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1.0].map(acc => (
            <g key={acc}>
              <line x1={padL} x2={padL + plotW} y1={toY(acc)} y2={toY(acc)} stroke="#E5DFD330" strokeWidth={1} />
              <text x={padL - 5} y={toY(acc)} textAnchor="end" dominantBaseline="middle"
                style={{ fontSize: '7px', fill: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace" }}>
                {(acc * 100).toFixed(0)}%
              </text>
            </g>
          ))}

          {/* Metric curves */}
          {activeMetrics.map(m => (
            <path key={m.key} d={generatePath(m.fn)} fill="none" stroke={m.color} strokeWidth={2} />
          ))}

          {/* Annotations */}
          {showAnnotations && selectedMetrics.includes('exact_match') && (
            <g>
              {/* "Phase transition" region */}
              <rect x={toX(9.8)} y={padT} width={toX(10.8) - toX(9.8)} height={plotH}
                fill="#C76B4A" opacity={0.05} />
              <text x={(toX(9.8) + toX(10.8)) / 2} y={padT + 12} textAnchor="middle"
                style={{ fontSize: '6.5px', fill: '#C76B4A', fontStyle: 'italic' }}>
                "emergent" zone
              </text>
            </g>
          )}

          {/* Legend */}
          {activeMetrics.map((m, i) => (
            <g key={m.key}>
              <line x1={padL + 5} x2={padL + 20} y1={padT + 6 + i * 11} y2={padT + 6 + i * 11} stroke={m.color} strokeWidth={2} />
              <text x={padL + 23} y={padT + 6 + i * 11} dominantBaseline="middle"
                style={{ fontSize: '7px', fill: '#5A6B5C' }}>
                {m.label}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={padL + plotW / 2} y={chartH - 0} textAnchor="middle"
            style={{ fontSize: '8px', fill: '#5A6B5C', fontWeight: 600 }}>
            Model Parameters ({viewMode === 'log' ? 'log' : 'linear'} scale)
          </text>
        </svg>
      </div>

      {/* Side-by-side comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C76B4A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            "Emergence is Real"
          </div>
          <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.72rem', color: '#5A6B5C', lineHeight: 1.6 }}>
            <li>Exact-match shows clear phase transition</li>
            <li>Abilities genuinely absent at small scale</li>
            <li>Qualitative shift in capability type</li>
            <li>Log-scale x-axis shows sudden jump</li>
          </ul>
        </div>
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8BA888', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            "Emergence is an Artifact"
          </div>
          <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.72rem', color: '#5A6B5C', lineHeight: 1.6 }}>
            <li>Token-level accuracy improves smoothly</li>
            <li>Nonlinear metrics create apparent jumps</li>
            <li>Linear x-axis shows gradual ramp</li>
            <li>No new capability, just threshold crossing</li>
          </ul>
        </div>
      </div>

      {/* Key formula */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.5rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Exact Match</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#C76B4A' }}>p^k (k=5)</div>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>nonlinear metric</div>
        </div>
        <div style={{ padding: '0.5rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Token Acc</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#8BA888' }}>p (direct)</div>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>linear metric</div>
        </div>
        <div style={{ padding: '0.5rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Brier Score</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#D4A843' }}>1-(1-p)^2</div>
          <div style={{ fontSize: '0.55rem', color: '#7A8B7C' }}>smooth metric</div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Key finding (Schaeffer et al., 2023):</strong> When per-token accuracy (p) improves smoothly with scale, exact-match accuracy (p^k) creates an illusion of sudden emergence. The "phase transition" is a mathematical artifact of the nonlinear metric, not a fundamental property of the model. Try toggling metrics to see this for yourself.
      </div>
    </div>
  );
}
