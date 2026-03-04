import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function PipelineBubbleDemo() {
  const [numStages, setNumStages] = useState(4);
  const [numMicroBatches, setNumMicroBatches] = useState(8);
  const [schedule, setSchedule] = useState<'gpipe' | '1f1b'>('gpipe');

  const timeline = useMemo(() => {
    const stages = numStages;
    const mbs = numMicroBatches;

    if (schedule === 'gpipe') {
      // GPipe: all forward passes first, then all backward passes
      // Each cell in the timeline grid represents one time slot
      // Forward: micro-batch m starts at stage s at time s + m
      // Backward: micro-batch m starts at stage (stages-1-s) at time (stages + mbs - 1) + (stages - 1 - s) + m
      const forwardEnd = stages + mbs - 1; // last forward finishes
      const backwardStart = forwardEnd; // backward starts immediately after
      const backwardEnd = backwardStart + stages + mbs - 1;
      const totalSlots = backwardEnd;

      const grid: { type: 'idle' | 'forward' | 'backward'; mb: number }[][] = Array.from(
        { length: stages },
        () => Array.from({ length: totalSlots }, () => ({ type: 'idle' as const, mb: -1 }))
      );

      // Fill forward passes
      for (let m = 0; m < mbs; m++) {
        for (let s = 0; s < stages; s++) {
          const t = s + m;
          if (t < totalSlots) {
            grid[s][t] = { type: 'forward', mb: m };
          }
        }
      }

      // Fill backward passes (reverse stage order)
      for (let m = 0; m < mbs; m++) {
        for (let s = stages - 1; s >= 0; s--) {
          const t = backwardStart + (stages - 1 - s) + m;
          if (t < totalSlots) {
            grid[s][t] = { type: 'backward', mb: m };
          }
        }
      }

      // Count bubbles
      let totalBusy = 0;
      let totalSlotCount = 0;
      for (let s = 0; s < stages; s++) {
        for (let t = 0; t < totalSlots; t++) {
          totalSlotCount++;
          if (grid[s][t].type !== 'idle') totalBusy++;
        }
      }

      const bubbleRatio = ((totalSlotCount - totalBusy) / totalSlotCount) * 100;

      return { grid, totalSlots, bubbleRatio, stages };
    } else {
      // 1F1B: interleave forward and backward passes
      // Stage s starts forward at time s
      // After the warm-up phase, each stage alternates 1 forward and 1 backward
      const warmupSteps = stages; // warm-up: forward fills the pipeline
      const steadySteps = mbs - stages; // steady state: 1F1B
      const cooldownSteps = stages; // cool-down: drain backward

      // Total time: warmup + 2 * steady + cooldown (each steady tick has F+B)
      const totalSlots = warmupSteps + Math.max(0, steadySteps) * 2 + cooldownSteps + stages - 1;
      const actualSlots = Math.max(totalSlots, stages + mbs * 2);

      const grid: { type: 'idle' | 'forward' | 'backward'; mb: number }[][] = Array.from(
        { length: stages },
        () => Array.from({ length: actualSlots }, () => ({ type: 'idle' as const, mb: -1 }))
      );

      // For 1F1B, each stage processes:
      // 1. Forward passes for warm-up: stage s does forwards at times s, s+1, ..., s + (stages-1-s)
      //    Actually, let's do a simpler model:
      // Stage 0 sees micro-batches first.
      // Forward micro-batch m at stage s happens at time: s + m (same as gpipe for forwards)
      // But backward starts earlier - once last stage finishes forward for mb 0

      // Simplified 1F1B timeline:
      // Each stage s:
      //   Warm-up: do (stages - s) forward passes
      //   Steady: alternate 1B, 1F for (mbs - stages + s) iterations
      //   Cool-down: do remaining backward passes

      let fwdDone = Array(stages).fill(0); // next forward mb to schedule per stage
      let bwdDone = Array(stages).fill(0); // next backward mb to schedule per stage
      let time = Array(stages).fill(0);

      // Simple scheduling approach per stage
      for (let s = 0; s < stages; s++) {
        let t = s; // stage s starts at time s
        // Warm-up: stages - s forward passes
        const warmup = Math.min(stages - s, mbs);
        for (let w = 0; w < warmup; w++) {
          const mb = fwdDone[s];
          if (t < actualSlots && mb < mbs) {
            grid[s][t] = { type: 'forward', mb };
            fwdDone[s]++;
          }
          t++;
        }
        // Steady state: alternate backward, forward
        while (fwdDone[s] < mbs || bwdDone[s] < mbs) {
          if (bwdDone[s] < mbs && bwdDone[s] < fwdDone[s]) {
            if (t < actualSlots) {
              grid[s][t] = { type: 'backward', mb: bwdDone[s] };
              bwdDone[s]++;
            }
            t++;
          }
          if (fwdDone[s] < mbs) {
            if (t < actualSlots) {
              grid[s][t] = { type: 'forward', mb: fwdDone[s] };
              fwdDone[s]++;
            }
            t++;
          } else if (bwdDone[s] < mbs) {
            if (t < actualSlots) {
              grid[s][t] = { type: 'backward', mb: bwdDone[s] };
              bwdDone[s]++;
            }
            t++;
          } else {
            break;
          }
        }
      }

      // Find actual used width
      let maxT = 0;
      for (let s = 0; s < stages; s++) {
        for (let t = actualSlots - 1; t >= 0; t--) {
          if (grid[s][t].type !== 'idle') {
            maxT = Math.max(maxT, t + 1);
            break;
          }
        }
      }

      const trimmedGrid = grid.map(row => row.slice(0, maxT));

      let totalBusy = 0;
      let totalSlotCount = 0;
      for (let s = 0; s < stages; s++) {
        for (let t = 0; t < maxT; t++) {
          totalSlotCount++;
          if (trimmedGrid[s][t].type !== 'idle') totalBusy++;
        }
      }

      const bubbleRatio = ((totalSlotCount - totalBusy) / totalSlotCount) * 100;

      return { grid: trimmedGrid, totalSlots: maxT, bubbleRatio, stages };
    }
  }, [numStages, numMicroBatches, schedule]);

  const cellColors = {
    idle: '#E5DFD3',
    forward: '#8BA888',
    backward: '#C76B4A',
  };

  // Limit displayed columns to keep it readable
  const maxDisplayCols = 40;
  const displayCols = Math.min(timeline.totalSlots, maxDisplayCols);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Pipeline Bubble Demo
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Visualize pipeline parallelism schedules. See how micro-batches flow through stages and where idle bubbles form.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Pipeline Stages</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numStages}</span>
          </div>
          <input type="range" min={2} max={8} step={1} value={numStages}
            onChange={e => setNumStages(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Micro-Batches</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{numMicroBatches}</span>
          </div>
          <input type="range" min={1} max={16} step={1} value={numMicroBatches}
            onChange={e => setNumMicroBatches(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Schedule toggle */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
        {(['gpipe', '1f1b'] as const).map(s => (
          <button key={s} onClick={() => setSchedule(s)} style={{
            padding: '0.35rem 0.8rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
            border: `1px solid ${schedule === s ? '#C76B4A' : '#E5DFD3'}`,
            background: schedule === s ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: schedule === s ? '#C76B4A' : '#5A6B5C',
            fontWeight: schedule === s ? 600 : 400,
            cursor: 'pointer',
          }}>
            {s === 'gpipe' ? 'GPipe' : '1F1B'}
          </button>
        ))}
      </div>

      {/* Pipeline timeline grid */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', overflowX: 'auto' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          PIPELINE SCHEDULE ({schedule.toUpperCase()})
        </div>

        {/* Time axis */}
        <div style={{ display: 'grid', gridTemplateColumns: `50px repeat(${displayCols}, 1fr)`, gap: '1px', marginBottom: '2px' }}>
          <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }} />
          {Array.from({ length: displayCols }, (_, t) => (
            <div key={t} style={{
              fontSize: '0.4rem', color: '#7A8B7C', textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {t}
            </div>
          ))}
        </div>

        {/* Stage rows */}
        {timeline.grid.map((row, s) => (
          <div key={s} style={{
            display: 'grid', gridTemplateColumns: `50px repeat(${displayCols}, 1fr)`,
            gap: '1px', marginBottom: '1px',
          }}>
            <div style={{
              fontSize: '0.55rem', color: '#2C3E2D', fontWeight: 600,
              display: 'flex', alignItems: 'center',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Stage {s}
            </div>
            {row.slice(0, displayCols).map((cell, t) => (
              <div key={t} style={{
                height: '22px',
                background: cellColors[cell.type],
                borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
                opacity: cell.type === 'idle' ? 0.4 : 0.85,
              }}>
                {cell.type !== 'idle' && displayCols <= 24 && (
                  <span style={{
                    fontSize: '0.4rem', color: '#FDFBF7', fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {cell.type === 'forward' ? 'F' : 'B'}{cell.mb}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          {[
            { label: 'Forward', color: '#8BA888' },
            { label: 'Backward', color: '#C76B4A' },
            { label: 'Idle (bubble)', color: '#E5DFD3' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color, opacity: item.label === 'Idle (bubble)' ? 0.4 : 0.85 }} />
              <span style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bubble ratio visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          PIPELINE UTILIZATION
        </div>
        <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.3rem' }}>
          <div style={{
            width: `${100 - timeline.bubbleRatio}%`,
            background: '#8BA888', transition: 'width 0.3s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.55rem', color: '#FDFBF7', fontWeight: 600 }}>Compute</span>
          </div>
          <div style={{
            width: `${timeline.bubbleRatio}%`,
            background: '#E5DFD3', transition: 'width 0.3s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.55rem', color: '#7A8B7C', fontWeight: 600 }}>Bubble</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Bubble Ratio</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            {timeline.bubbleRatio.toFixed(1)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Time Slots</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>
            {timeline.totalSlots}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Schedule</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {schedule.toUpperCase()}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Ideal Bubble</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#5B8DB8' }}>
            {((numStages - 1) / (numMicroBatches + numStages - 1) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {numMicroBatches <= numStages
            ? `With only ${numMicroBatches} micro-batches across ${numStages} stages, the bubble ratio is very high (${timeline.bubbleRatio.toFixed(0)}%). The pipeline cannot stay busy. Increase micro-batches to at least 4x the number of stages for reasonable efficiency.`
            : schedule === 'gpipe'
              ? `GPipe processes all ${numMicroBatches} forward passes before starting backward passes. The bubble ratio of ${timeline.bubbleRatio.toFixed(0)}% comes from the pipeline fill and drain phases. The theoretical minimum is (p-1)/(m+p-1) = ${((numStages - 1) / (numMicroBatches + numStages - 1) * 100).toFixed(0)}%. More micro-batches reduce the bubble fraction but increase activation memory.`
              : `1F1B interleaves forward and backward passes: after the warm-up phase, each stage alternates one forward and one backward. This reduces peak activation memory compared to GPipe because activations are freed sooner, while maintaining a similar bubble ratio of ${timeline.bubbleRatio.toFixed(0)}%.`}
        </div>
      </div>
    </div>
  );
}
