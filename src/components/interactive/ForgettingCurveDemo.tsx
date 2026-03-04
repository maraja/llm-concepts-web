import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

type Method = 'none' | 'ewc' | 'replay';

export default function ForgettingCurveDemo() {
  const [method, setMethod] = useState<Method>('none');
  const [ewcLambda, setEwcLambda] = useState(50);
  const [trainingStep, setTrainingStep] = useState(50);

  const totalSteps = 100;
  const taskBStart = 50; // Task B training begins at step 50

  const curves = useMemo(() => {
    const points = [];
    for (let step = 0; step <= totalSteps; step++) {
      // Task A performance
      let taskANone: number, taskAEwc: number, taskAReplay: number;
      // Task B performance
      let taskBNone: number, taskBEwc: number, taskBReplay: number;

      if (step <= taskBStart) {
        // Phase 1: Training on Task A only
        const progress = step / taskBStart;
        const taskAAcc = 20 + 75 * (1 - Math.exp(-3 * progress));

        taskANone = taskAAcc;
        taskAEwc = taskAAcc;
        taskAReplay = taskAAcc;

        taskBNone = 10;
        taskBEwc = 10;
        taskBReplay = 10;
      } else {
        // Phase 2: Training on Task B
        const bProgress = (step - taskBStart) / (totalSteps - taskBStart);

        // Task B learning (slightly slower with EWC due to constraints)
        taskBNone = 10 + 82 * (1 - Math.exp(-4 * bProgress));
        taskBEwc = 10 + 72 * (1 - Math.exp(-3 * bProgress));
        taskBReplay = 10 + 78 * (1 - Math.exp(-3.5 * bProgress));

        // Task A forgetting
        const forgettingRate = bProgress;

        // No regularization: catastrophic forgetting
        taskANone = 95 - 70 * (1 - Math.exp(-4 * forgettingRate));

        // EWC: forgetting depends on lambda
        const ewcProtection = Math.min(ewcLambda / 100, 0.95);
        taskAEwc = 95 - (70 * (1 - ewcProtection)) * (1 - Math.exp(-3 * forgettingRate));

        // Replay: maintains Task A reasonably well
        taskAReplay = 95 - 20 * (1 - Math.exp(-2 * forgettingRate));
      }

      points.push({
        step,
        taskA: { none: taskANone, ewc: taskAEwc, replay: taskAReplay },
        taskB: { none: taskBNone, ewc: taskBEwc, replay: taskBReplay },
      });
    }
    return points;
  }, [ewcLambda]);

  const currentPoint = curves[trainingStep];

  const chartWidth = 500;
  const chartHeight = 160;
  const padLeft = 40;
  const padBottom = 25;
  const padTop = 10;
  const padRight = 10;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const toX = (step: number) => padLeft + (step / totalSteps) * plotW;
  const toY = (acc: number) => padTop + plotH - ((acc - 5) / 100) * plotH;

  const makePath = (accessor: (p: typeof curves[0]) => number, maxStep: number) => {
    return curves
      .filter(p => p.step <= maxStep)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.step).toFixed(1)} ${toY(accessor(p)).toFixed(1)}`)
      .join(' ');
  };

  const taskAPath = makePath(p => p.taskA[method], trainingStep);
  const taskBPath = makePath(p => p.taskB[method], trainingStep);

  const methods: Array<{ key: Method; label: string }> = [
    { key: 'none', label: 'No Protection' },
    { key: 'ewc', label: 'EWC' },
    { key: 'replay', label: 'Replay' },
  ];

  const taskAAcc = currentPoint.taskA[method];
  const taskBAcc = currentPoint.taskB[method];
  const forgettingAmount = trainingStep > taskBStart ? Math.max(0, 95 - taskAAcc) : 0;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Catastrophic Forgetting Curves
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Observe how Task A performance degrades when the model starts learning Task B, and compare mitigation strategies.
        </p>
      </div>

      {/* Method selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {methods.map(m => (
          <button key={m.key} onClick={() => setMethod(m.key)} style={{
            padding: '0.4rem 0.8rem', borderRadius: '6px',
            border: `1px solid ${method === m.key ? '#8BA888' : '#E5DFD3'}`,
            background: method === m.key ? '#8BA88815' : '#FDFBF7',
            color: method === m.key ? '#3D5240' : '#5A6B5C',
            fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
            transition: 'all 0.15s ease',
          }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Training Step</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{trainingStep}</span>
          </div>
          <input type="range" min={0} max={totalSteps} step={1} value={trainingStep}
            onChange={e => setTrainingStep(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', fontSize: '0.6rem', color: '#7A8B7C' }}>
            <span>Task A training</span>
            <span>|</span>
            <span>Task B training</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>EWC Lambda</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: method === 'ewc' ? '#C76B4A' : '#7A8B7C', fontWeight: 600 }}>{ewcLambda}</span>
          </div>
          <input type="range" min={0} max={100} step={5} value={ewcLambda}
            onChange={e => setEwcLambda(Number(e.target.value))}
            disabled={method !== 'ewc'}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: method === 'ewc' ? 'linear-gradient(to right, #C76B4A, #8BA888)' : '#E5DFD3', borderRadius: '3px', cursor: method === 'ewc' ? 'pointer' : 'default', opacity: method === 'ewc' ? 1 : 0.4 }}
          />
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ display: 'block' }}>
          {/* Grid lines */}
          {[20, 40, 60, 80, 100].map(v => (
            <g key={v}>
              <line x1={padLeft} y1={toY(v)} x2={chartWidth - padRight} y2={toY(v)} stroke="#E5DFD3" strokeWidth={1} />
              <text x={padLeft - 5} y={toY(v) + 3} textAnchor="end" fontSize={8} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace">{v}%</text>
            </g>
          ))}

          {/* Task B start marker */}
          <line x1={toX(taskBStart)} y1={padTop} x2={toX(taskBStart)} y2={padTop + plotH} stroke="#C76B4A" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
          <text x={toX(taskBStart)} y={padTop - 2} textAnchor="middle" fontSize={8} fill="#C76B4A" fontFamily="'JetBrains Mono', monospace">Task B starts</text>

          {/* Task A line */}
          {taskAPath && <path d={taskAPath} fill="none" stroke="#8BA888" strokeWidth={2.5} strokeLinecap="round" />}
          {/* Task B line */}
          {taskBPath && <path d={taskBPath} fill="none" stroke="#D4A843" strokeWidth={2.5} strokeLinecap="round" />}

          {/* Current position markers */}
          <circle cx={toX(trainingStep)} cy={toY(taskAAcc)} r={4} fill="#8BA888" stroke="#FDFBF7" strokeWidth={1.5} />
          <circle cx={toX(trainingStep)} cy={toY(taskBAcc)} r={4} fill="#D4A843" stroke="#FDFBF7" strokeWidth={1.5} />

          {/* X-axis labels */}
          {[0, 25, 50, 75, 100].map(s => (
            <text key={s} x={toX(s)} y={chartHeight - 3} textAnchor="middle" fontSize={8} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace">{s}</text>
          ))}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#5A6B5C' }}>
            <div style={{ width: 14, height: 3, background: '#8BA888', borderRadius: 2 }} />
            Task A Accuracy
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#5A6B5C' }}>
            <div style={{ width: 14, height: 3, background: '#D4A843', borderRadius: 2 }} />
            Task B Accuracy
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Task A Acc</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: taskAAcc > 70 ? '#3D5240' : taskAAcc > 40 ? '#D4A843' : '#C76B4A' }}>
            {taskAAcc.toFixed(1)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Task B Acc</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: taskBAcc > 70 ? '#3D5240' : taskBAcc > 40 ? '#D4A843' : '#C76B4A' }}>
            {taskBAcc.toFixed(1)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Forgetting</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: forgettingAmount < 10 ? '#3D5240' : forgettingAmount < 30 ? '#D4A843' : '#C76B4A' }}>
            {forgettingAmount.toFixed(1)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Method</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2C3E2D' }}>
            {method === 'none' ? 'Naive' : method === 'ewc' ? 'EWC' : 'Replay'}
          </div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> {method === 'none'
          ? trainingStep <= taskBStart
            ? 'The model is currently learning Task A. Catastrophic forgetting will begin once Task B training starts at step 50.'
            : 'Without protection, Task A performance drops catastrophically as Task B overwrites the same parameters. This is the fundamental problem of sequential learning.'
          : method === 'ewc'
          ? ewcLambda < 30
            ? 'Low EWC lambda provides weak protection. Important parameters for Task A are still being modified too freely during Task B training.'
            : ewcLambda < 70
            ? 'Moderate EWC lambda balances the plasticity-stability tradeoff. Task A is partially preserved while Task B can still learn effectively.'
            : 'High EWC lambda strongly preserves Task A parameters, but may limit Task B learning capacity. This is the stability-plasticity dilemma.'
          : 'Experience replay periodically retrains on Task A examples during Task B learning, maintaining performance on both tasks at the cost of additional compute and memory.'}
      </div>
    </div>
  );
}
