import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

interface Benchmark {
  key: string;
  label: string;
  description: string;
  // Accuracy at different scales [1e8, 1e9, 1e10, 5e10, 1e11, 5e11]
  pattern: 'emergent' | 'gradual';
  dataPoints: { logParams: number; accuracy: number }[];
  color: string;
}

const BENCHMARKS: Benchmark[] = [
  {
    key: 'arithmetic',
    label: 'Multi-digit Arithmetic',
    description: '3-digit addition and multiplication',
    pattern: 'emergent',
    color: '#C76B4A',
    dataPoints: [
      { logParams: 8, accuracy: 0.02 },
      { logParams: 8.5, accuracy: 0.02 },
      { logParams: 9, accuracy: 0.03 },
      { logParams: 9.5, accuracy: 0.03 },
      { logParams: 10, accuracy: 0.05 },
      { logParams: 10.3, accuracy: 0.08 },
      { logParams: 10.5, accuracy: 0.15 },
      { logParams: 10.7, accuracy: 0.45 },
      { logParams: 11, accuracy: 0.78 },
      { logParams: 11.5, accuracy: 0.88 },
      { logParams: 12, accuracy: 0.92 },
    ],
  },
  {
    key: 'cot',
    label: 'Chain-of-Thought',
    description: 'Multi-step reasoning with CoT prompting',
    pattern: 'emergent',
    color: '#D4A843',
    dataPoints: [
      { logParams: 8, accuracy: 0.01 },
      { logParams: 8.5, accuracy: 0.01 },
      { logParams: 9, accuracy: 0.02 },
      { logParams: 9.5, accuracy: 0.02 },
      { logParams: 10, accuracy: 0.03 },
      { logParams: 10.3, accuracy: 0.05 },
      { logParams: 10.5, accuracy: 0.08 },
      { logParams: 10.7, accuracy: 0.20 },
      { logParams: 10.9, accuracy: 0.50 },
      { logParams: 11, accuracy: 0.72 },
      { logParams: 11.5, accuracy: 0.85 },
      { logParams: 12, accuracy: 0.90 },
    ],
  },
  {
    key: 'translation',
    label: 'Word Unscrambling',
    description: 'Rearranging scrambled letters into words',
    pattern: 'emergent',
    color: '#6E8B6B',
    dataPoints: [
      { logParams: 8, accuracy: 0.0 },
      { logParams: 9, accuracy: 0.01 },
      { logParams: 9.5, accuracy: 0.01 },
      { logParams: 10, accuracy: 0.02 },
      { logParams: 10.5, accuracy: 0.04 },
      { logParams: 10.7, accuracy: 0.10 },
      { logParams: 11, accuracy: 0.55 },
      { logParams: 11.3, accuracy: 0.80 },
      { logParams: 11.5, accuracy: 0.88 },
      { logParams: 12, accuracy: 0.93 },
    ],
  },
  {
    key: 'qa',
    label: 'Question Answering',
    description: 'Standard factual QA (TriviaQA-like)',
    pattern: 'gradual',
    color: '#8BA888',
    dataPoints: [
      { logParams: 8, accuracy: 0.08 },
      { logParams: 8.5, accuracy: 0.12 },
      { logParams: 9, accuracy: 0.18 },
      { logParams: 9.5, accuracy: 0.25 },
      { logParams: 10, accuracy: 0.34 },
      { logParams: 10.3, accuracy: 0.40 },
      { logParams: 10.5, accuracy: 0.48 },
      { logParams: 10.7, accuracy: 0.55 },
      { logParams: 11, accuracy: 0.64 },
      { logParams: 11.5, accuracy: 0.74 },
      { logParams: 12, accuracy: 0.82 },
    ],
  },
  {
    key: 'sentiment',
    label: 'Sentiment Analysis',
    description: 'Classifying text as positive/negative',
    pattern: 'gradual',
    color: '#7A8B7C',
    dataPoints: [
      { logParams: 8, accuracy: 0.55 },
      { logParams: 8.5, accuracy: 0.60 },
      { logParams: 9, accuracy: 0.66 },
      { logParams: 9.5, accuracy: 0.71 },
      { logParams: 10, accuracy: 0.76 },
      { logParams: 10.5, accuracy: 0.80 },
      { logParams: 11, accuracy: 0.85 },
      { logParams: 11.5, accuracy: 0.89 },
      { logParams: 12, accuracy: 0.92 },
    ],
  },
];

export default function EmergentAbilitiesTimeline() {
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>(['arithmetic', 'qa']);
  const [scaleMarker, setScaleMarker] = useState(10.5);

  const toggleBenchmark = (key: string) => {
    setSelectedBenchmarks(prev =>
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
  const toX = (logP: number) => padL + ((logP - logMin) / (logMax - logMin)) * plotW;
  const toY = (acc: number) => padT + plotH * (1 - acc);

  // Generate smooth curve through data points
  const generatePath = (dataPoints: { logParams: number; accuracy: number }[]) => {
    return dataPoints.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${toX(p.logParams)} ${toY(p.accuracy)}`
    ).join(' ');
  };

  const activeBenchmarks = useMemo(() =>
    BENCHMARKS.filter(b => selectedBenchmarks.includes(b.key)),
  [selectedBenchmarks]);

  // Find accuracy at scale marker
  const accuraciesAtScale = useMemo(() => {
    return activeBenchmarks.map(b => {
      // Linear interpolation
      let acc = 0;
      for (let i = 0; i < b.dataPoints.length - 1; i++) {
        const curr = b.dataPoints[i];
        const next = b.dataPoints[i + 1];
        if (scaleMarker >= curr.logParams && scaleMarker <= next.logParams) {
          const t = (scaleMarker - curr.logParams) / (next.logParams - curr.logParams);
          acc = curr.accuracy + t * (next.accuracy - curr.accuracy);
          break;
        }
        if (scaleMarker > b.dataPoints[b.dataPoints.length - 1].logParams) {
          acc = b.dataPoints[b.dataPoints.length - 1].accuracy;
        }
      }
      return { key: b.key, label: b.label, accuracy: acc, pattern: b.pattern, color: b.color };
    });
  }, [activeBenchmarks, scaleMarker]);

  const paramCount = Math.pow(10, scaleMarker);
  const formatParams = (n: number): string => {
    if (n >= 1e12) return `${(n / 1e12).toFixed(0)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
    return `${(n / 1e3).toFixed(0)}K`;
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Emergent Abilities Timeline
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Observe how certain capabilities appear suddenly at critical scale thresholds ("phase transitions") while others improve gradually.
        </p>
      </div>

      {/* Benchmark toggles */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {BENCHMARKS.map(b => (
          <button key={b.key} onClick={() => toggleBenchmark(b.key)} style={{
            padding: '0.3rem 0.6rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
            border: `1px solid ${selectedBenchmarks.includes(b.key) ? b.color : '#E5DFD3'}`,
            background: selectedBenchmarks.includes(b.key) ? `${b.color}10` : 'transparent',
            color: selectedBenchmarks.includes(b.key) ? b.color : '#5A6B5C',
            fontWeight: selectedBenchmarks.includes(b.key) ? 600 : 400,
            cursor: 'pointer',
          }}>
            {selectedBenchmarks.includes(b.key) ? '\u2713 ' : ''}{b.label}
          </button>
        ))}
      </div>

      {/* Scale slider */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Model scale</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>
            {formatParams(paramCount)} params
          </span>
        </div>
        <input type="range" min={8} max={12} step={0.1} value={scaleMarker}
          onChange={e => setScaleMarker(parseFloat(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.15rem' }}>
          <span>100M</span>
          <span>1T</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
          {/* Grid */}
          {[8, 9, 10, 11, 12].map(lp => (
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

          {/* Benchmark curves */}
          {activeBenchmarks.map(b => (
            <g key={b.key}>
              <path d={generatePath(b.dataPoints)} fill="none" stroke={b.color} strokeWidth={2} />
              {b.dataPoints.map((p, i) => (
                <circle key={i} cx={toX(p.logParams)} cy={toY(p.accuracy)} r={2.5} fill={b.color} />
              ))}
            </g>
          ))}

          {/* Scale marker */}
          <line x1={toX(scaleMarker)} x2={toX(scaleMarker)} y1={padT} y2={padT + plotH} stroke="#2C3E2D" strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />

          {/* Accuracy dots at marker */}
          {accuraciesAtScale.map(a => (
            <circle key={a.key} cx={toX(scaleMarker)} cy={toY(a.accuracy)} r={5} fill={a.color} stroke="#FDFBF7" strokeWidth={2} />
          ))}

          {/* Axis labels */}
          <text x={padL + plotW / 2} y={chartH - 0} textAnchor="middle"
            style={{ fontSize: '8px', fill: '#5A6B5C', fontWeight: 600 }}>
            Parameters (log scale)
          </text>
        </svg>
      </div>

      {/* Accuracy readouts */}
      {accuraciesAtScale.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(accuraciesAtScale.length, 3)}, 1fr)`, gap: '0.4rem', marginBottom: '1rem' }}>
          {accuraciesAtScale.map(a => (
            <div key={a.key} style={{ padding: '0.5rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{a.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: a.color }}>
                {(a.accuracy * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.55rem', color: '#7A8B7C', fontStyle: 'italic' }}>
                {a.pattern === 'emergent' ? 'phase transition' : 'gradual'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insight */}
      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> Emergent abilities like multi-digit arithmetic and chain-of-thought reasoning show near-zero performance until a critical scale (~10B-100B params), then rapidly jump to high accuracy. In contrast, tasks like QA and sentiment improve smoothly. Whether this is truly "emergent" or an artifact of how we measure is an active debate.
      </div>
    </div>
  );
}
