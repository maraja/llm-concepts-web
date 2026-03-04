import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

type ScheduleKey = 'constant' | 'cosine' | 'warmup_cosine' | 'wsd';

interface Schedule {
  name: string;
  color: string;
  fn: (step: number, totalSteps: number, warmupSteps: number, peakLR: number) => number;
}

const SCHEDULES: Record<ScheduleKey, Schedule> = {
  constant: {
    name: 'Constant',
    color: '#7A8B7C',
    fn: (_step, _total, _warmup, peakLR) => peakLR,
  },
  cosine: {
    name: 'Cosine Decay',
    color: '#D4A843',
    fn: (step, totalSteps, _warmup, peakLR) => {
      const minLR = peakLR * 0.01;
      return minLR + 0.5 * (peakLR - minLR) * (1 + Math.cos(Math.PI * step / totalSteps));
    },
  },
  warmup_cosine: {
    name: 'Warmup + Cosine',
    color: '#C76B4A',
    fn: (step, totalSteps, warmupSteps, peakLR) => {
      const minLR = peakLR * 0.01;
      if (step < warmupSteps) {
        return peakLR * (step / warmupSteps);
      }
      const decaySteps = totalSteps - warmupSteps;
      const decayStep = step - warmupSteps;
      return minLR + 0.5 * (peakLR - minLR) * (1 + Math.cos(Math.PI * decayStep / decaySteps));
    },
  },
  wsd: {
    name: 'WSD (Warmup-Stable-Decay)',
    color: '#8BA888',
    fn: (step, totalSteps, warmupSteps, peakLR) => {
      const minLR = peakLR * 0.01;
      const decayStart = totalSteps * 0.8;
      if (step < warmupSteps) {
        return peakLR * (step / warmupSteps);
      }
      if (step < decayStart) {
        return peakLR;
      }
      const decaySteps = totalSteps - decayStart;
      const decayStep = step - decayStart;
      return minLR + 0.5 * (peakLR - minLR) * (1 + Math.cos(Math.PI * decayStep / decaySteps));
    },
  },
};

export default function LRScheduleVisualizer() {
  const [warmupSteps, setWarmupSteps] = useState(2000);
  const [totalSteps, setTotalSteps] = useState(20000);
  const [peakLR, setPeakLR] = useState(0.0003);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [activeSchedules, setActiveSchedules] = useState<Set<ScheduleKey>>(new Set(['warmup_cosine', 'wsd']));

  const toggleSchedule = (key: ScheduleKey) => {
    setActiveSchedules(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Generate schedule values
  const numDisplayPoints = 100;
  const scheduleData = useMemo(() => {
    const data: Record<ScheduleKey, number[]> = {} as any;
    for (const key of Object.keys(SCHEDULES) as ScheduleKey[]) {
      data[key] = [];
      for (let i = 0; i <= numDisplayPoints; i++) {
        const step = Math.round((i / numDisplayPoints) * totalSteps);
        data[key].push(SCHEDULES[key].fn(step, totalSteps, warmupSteps, peakLR));
      }
    }
    return data;
  }, [totalSteps, warmupSteps, peakLR]);

  const hoverValues = useMemo(() => {
    if (hoverStep === null) return null;
    const step = Math.round((hoverStep / numDisplayPoints) * totalSteps);
    const values: Record<string, number> = {};
    for (const key of Object.keys(SCHEDULES) as ScheduleKey[]) {
      values[key] = SCHEDULES[key].fn(step, totalSteps, warmupSteps, peakLR);
    }
    return { step, values };
  }, [hoverStep, totalSteps, warmupSteps, peakLR]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Learning Rate Schedules
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare common LR schedules. Toggle schedules to overlay them. Hover over the chart to see exact values at each step.
        </p>
      </div>

      {/* Schedule toggles */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(Object.keys(SCHEDULES) as ScheduleKey[]).map(key => (
          <button key={key} onClick={() => toggleSchedule(key)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${activeSchedules.has(key) ? SCHEDULES[key].color : '#E5DFD3'}`,
            background: activeSchedules.has(key) ? `${SCHEDULES[key].color}14` : 'transparent',
            color: activeSchedules.has(key) ? SCHEDULES[key].color : '#5A6B5C',
            fontWeight: activeSchedules.has(key) ? 600 : 400,
            fontSize: '0.75rem', cursor: 'pointer',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {SCHEDULES[key].name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Warmup Steps', value: warmupSteps, set: setWarmupSteps, min: 0, max: Math.floor(totalSteps * 0.3), step: 100, fmt: (v: number) => `${(v / 1000).toFixed(1)}K` },
          { label: 'Total Steps', value: totalSteps, set: setTotalSteps, min: 5000, max: 100000, step: 1000, fmt: (v: number) => `${(v / 1000).toFixed(0)}K` },
          { label: 'Peak LR', value: peakLR, set: setPeakLR, min: 0.00001, max: 0.001, step: 0.00001, fmt: (v: number) => v.toExponential(1) },
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

      {/* Chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#7A8B7C', fontWeight: 600 }}>Learning rate over training</span>
          {hoverValues && (
            <span style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#5A6B5C' }}>
              Step {hoverValues.step.toLocaleString()}
            </span>
          )}
        </div>
        <div
          style={{ position: 'relative', height: '160px', cursor: 'crosshair' }}
          onMouseMove={e => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            setHoverStep(Math.round(x * numDisplayPoints));
          }}
          onMouseLeave={() => setHoverStep(null)}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <div key={frac} style={{
              position: 'absolute', top: `${frac * 100}%`, left: 0, right: 0,
              borderBottom: '1px dashed #E5DFD3',
            }} />
          ))}
          {/* Warmup boundary */}
          {warmupSteps > 0 && (
            <div style={{
              position: 'absolute', left: `${(warmupSteps / totalSteps) * 100}%`, top: 0, bottom: 0,
              borderLeft: '1px dashed rgba(199, 107, 74, 0.3)',
            }}>
              <span style={{ position: 'absolute', top: '-14px', left: '2px', fontSize: '0.5rem', color: '#C76B4A' }}>warmup</span>
            </div>
          )}
          {/* Schedule lines rendered as columns of dots */}
          {(Object.keys(SCHEDULES) as ScheduleKey[]).filter(k => activeSchedules.has(k)).map(key => (
            scheduleData[key].map((lr, i) => {
              const yFrac = 1 - (lr / peakLR);
              return (
                <div key={`${key}-${i}`} style={{
                  position: 'absolute',
                  left: `${(i / numDisplayPoints) * 100}%`,
                  top: `${yFrac * 100}%`,
                  width: '3px', height: '3px',
                  borderRadius: '50%',
                  background: SCHEDULES[key].color,
                  opacity: 0.8,
                  transform: 'translate(-50%, -50%)',
                }} />
              );
            })
          ))}
          {/* Hover line */}
          {hoverStep !== null && (
            <div style={{
              position: 'absolute', left: `${(hoverStep / numDisplayPoints) * 100}%`,
              top: 0, bottom: 0, width: '1px', background: '#2C3E2D', opacity: 0.3,
            }} />
          )}
        </div>
        {/* X-axis */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.3rem' }}>
          <span>0</span>
          <span>{(totalSteps / 2000).toFixed(0)}K</span>
          <span>{(totalSteps / 1000).toFixed(0)}K steps</span>
        </div>
      </div>

      {/* Hover values */}
      {hoverValues && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeSchedules.size}, 1fr)`, gap: '0.5rem', marginBottom: '1rem' }}>
          {(Object.keys(SCHEDULES) as ScheduleKey[]).filter(k => activeSchedules.has(k)).map(key => (
            <div key={key} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{SCHEDULES[key].name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: SCHEDULES[key].color }}>
                {hoverValues.values[key].toExponential(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Peak LR</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: '#C76B4A' }}>{peakLR.toExponential(1)}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Warmup Ratio</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: '#D4A843' }}>{((warmupSteps / totalSteps) * 100).toFixed(1)}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Min LR</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: '#3D5240' }}>{(peakLR * 0.01).toExponential(1)}</div>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>1% of peak</div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          Modern LLM training typically uses warmup + cosine decay. The warmup phase ({warmupSteps.toLocaleString()} steps = {((warmupSteps / totalSteps) * 100).toFixed(1)}% of training) prevents early instability by starting with a tiny LR. WSD (Warmup-Stable-Decay) is gaining popularity as it allows extending training without committing to a fixed schedule upfront.
        </div>
      </div>
    </div>
  );
}
