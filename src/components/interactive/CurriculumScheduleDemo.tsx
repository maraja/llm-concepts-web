import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

type Strategy = 'random' | 'easy-to-hard' | 'hard-to-easy';

const STRATEGIES: { key: Strategy; label: string; color: string; description: string }[] = [
  { key: 'random', label: 'Random', color: '#7A8B7C', description: 'Samples drawn uniformly at random (standard training)' },
  { key: 'easy-to-hard', label: 'Easy → Hard', color: '#8BA888', description: 'Start with simple examples, gradually increase difficulty' },
  { key: 'hard-to-easy', label: 'Hard → Easy', color: '#C76B4A', description: 'Start with hardest examples first (anti-curriculum)' },
];

// Simulated loss curves for each strategy
const getLoss = (strategy: Strategy, step: number): number => {
  const t = step / 100;
  switch (strategy) {
    case 'random':
      return 2.5 * Math.exp(-2.0 * t) + 0.45 + 0.08 * Math.sin(t * 15) * Math.exp(-t * 2);
    case 'easy-to-hard':
      return 2.5 * Math.exp(-2.5 * t) + 0.38 + 0.05 * Math.sin(t * 10) * Math.exp(-t * 3);
    case 'hard-to-easy':
      return 2.8 * Math.exp(-1.2 * t) + 0.55 + 0.15 * Math.sin(t * 8) * Math.exp(-t);
  }
};

// Difficulty distribution at a given step
const getDifficultyDist = (strategy: Strategy, step: number): number[] => {
  const t = step / 100;
  // Return 5 bins: easiest to hardest
  switch (strategy) {
    case 'random':
      return [0.2, 0.2, 0.2, 0.2, 0.2];
    case 'easy-to-hard': {
      const peak = Math.min(t * 5, 4);
      return [0, 1, 2, 3, 4].map(i => {
        const dist = Math.abs(i - peak);
        return Math.exp(-dist * dist * 0.8);
      });
    }
    case 'hard-to-easy': {
      const peak = Math.max(4 - t * 5, 0);
      return [0, 1, 2, 3, 4].map(i => {
        const dist = Math.abs(i - peak);
        return Math.exp(-dist * dist * 0.8);
      });
    }
  }
};

const DIFFICULTY_LABELS = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
const DIFFICULTY_COLORS = ['#8BA888', '#A8C4A5', '#D4A843', '#D48843', '#C76B4A'];

export default function CurriculumScheduleDemo() {
  const [strategy, setStrategy] = useState<Strategy>('easy-to-hard');
  const [step, setStep] = useState(25);

  const currentLoss = useMemo(() => getLoss(strategy, step), [strategy, step]);
  const diffDist = useMemo(() => {
    const raw = getDifficultyDist(strategy, step);
    const sum = raw.reduce((s, v) => s + v, 0);
    return raw.map(v => v / sum);
  }, [strategy, step]);

  // SVG chart dimensions
  const chartW = 400;
  const chartH = 140;
  const padL = 35;
  const padR = 10;
  const padT = 10;
  const padB = 25;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const lossToY = (loss: number) => padT + plotH * (1 - (3 - loss) / 2.6);
  const stepToX = (s: number) => padL + (s / 100) * plotW;

  const generatePath = (strat: Strategy) => {
    const points: string[] = [];
    for (let s = 0; s <= 100; s += 1) {
      const x = stepToX(s);
      const y = lossToY(getLoss(strat, s));
      points.push(`${s === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  };

  const activeStrat = STRATEGIES.find(s => s.key === strategy)!;
  const finalLosses = useMemo(() =>
    STRATEGIES.map(s => ({ key: s.key, label: s.label, loss: getLoss(s.key, 100).toFixed(3) })),
  []);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Curriculum Learning Schedule
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare data ordering strategies. Watch how difficulty distribution changes over training and its effect on convergence.
        </p>
      </div>

      {/* Strategy selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STRATEGIES.map(s => (
          <button key={s.key} onClick={() => setStrategy(s.key)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
            border: `1px solid ${strategy === s.key ? s.color : '#E5DFD3'}`,
            background: strategy === s.key ? `${s.color}10` : 'transparent',
            color: strategy === s.key ? s.color : '#5A6B5C',
            fontWeight: strategy === s.key ? 600 : 400,
            cursor: 'pointer',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '0.75rem', color: '#5A6B5C', marginBottom: '1rem', fontStyle: 'italic' }}>
        {activeStrat.description}
      </div>

      {/* Training step slider */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Training step</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>Step {step}%</span>
        </div>
        <input type="range" min={0} max={100} step={1} value={step}
          onChange={e => setStep(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
      </div>

      {/* Difficulty distribution at current step */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Current difficulty distribution (step {step}%)</div>
        <div style={{ display: 'flex', gap: '0.35rem', height: '60px', alignItems: 'flex-end' }}>
          {diffDist.map((weight, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '100%',
                height: `${weight * 100}%`,
                background: DIFFICULTY_COLORS[i],
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.3s ease',
                minHeight: '2px',
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.3rem' }}>
          {DIFFICULTY_LABELS.map((label, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.55rem', color: '#7A8B7C' }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Loss curves */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Convergence curves (all strategies)</div>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
          {/* Y-axis labels */}
          {[0.5, 1.5, 2.5].map(v => (
            <g key={v}>
              <text x={padL - 5} y={lossToY(v)} textAnchor="end" dominantBaseline="middle"
                style={{ fontSize: '8px', fill: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace" }}>
                {v.toFixed(1)}
              </text>
              <line x1={padL} x2={padL + plotW} y1={lossToY(v)} y2={lossToY(v)} stroke="#E5DFD340" strokeWidth={1} />
            </g>
          ))}
          {/* X-axis labels */}
          {[0, 25, 50, 75, 100].map(s => (
            <text key={s} x={stepToX(s)} y={chartH - 5} textAnchor="middle"
              style={{ fontSize: '8px', fill: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace" }}>
              {s}%
            </text>
          ))}
          {/* Loss curves for all strategies */}
          {STRATEGIES.map(s => (
            <path key={s.key} d={generatePath(s.key)}
              fill="none" stroke={s.color}
              strokeWidth={s.key === strategy ? 2.5 : 1}
              opacity={s.key === strategy ? 1 : 0.3}
            />
          ))}
          {/* Current position marker */}
          <circle cx={stepToX(step)} cy={lossToY(currentLoss)} r={5} fill={activeStrat.color} stroke="#FDFBF7" strokeWidth={2} />
          <line x1={stepToX(step)} y1={padT} x2={stepToX(step)} y2={padT + plotH} stroke={activeStrat.color} strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />
        </svg>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {finalLosses.map(fl => (
          <div key={fl.key} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{fl.label} (final)</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: strategy === fl.key ? '#C76B4A' : '#5A6B5C' }}>{fl.loss}</div>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> Easy-to-hard curriculum learning often converges faster and to a lower final loss. The model first learns basic patterns, then refines on harder examples. Anti-curriculum (hard-to-easy) typically hurts because the model encounters confusing examples before it has the basics.
      </div>
    </div>
  );
}
