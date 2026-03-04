import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export default function ParameterInterferenceViz() {
  const [step, setStep] = useState<'initial' | 'taskA' | 'taskB'>('initial');
  const [overlap, setOverlap] = useState(50);
  const gridSize = 10;

  const neurons = useMemo(() => {
    const rng = seededRandom(123);
    const totalNeurons = gridSize * gridSize;
    const result = [];

    for (let i = 0; i < totalNeurons; i++) {
      // Task A importance: how critical this neuron is for Task A
      const taskAImportance = rng();

      // Task B importance: correlated with Task A based on overlap %
      // Higher overlap = Task B needs the same neurons as Task A
      let taskBImportance: number;
      if (rng() < overlap / 100) {
        // This neuron is needed by both tasks
        taskBImportance = 0.5 + rng() * 0.5;
      } else {
        // This neuron is primarily for one task
        taskBImportance = rng() * 0.4;
      }

      // Task B modification: how much Task B changes this neuron
      const taskBModification = taskBImportance * (0.5 + rng() * 0.5);

      // Interference: how much Task A is damaged by Task B training
      const interference = taskAImportance * taskBModification;

      result.push({
        index: i,
        taskAImportance,
        taskBImportance,
        taskBModification,
        interference,
        isImportantForA: taskAImportance > 0.5,
        isImportantForB: taskBImportance > 0.5,
        isInterfered: interference > 0.3,
      });
    }
    return result;
  }, [overlap]);

  const stats = useMemo(() => {
    const importantA = neurons.filter(n => n.isImportantForA).length;
    const importantB = neurons.filter(n => n.isImportantForB).length;
    const shared = neurons.filter(n => n.isImportantForA && n.isImportantForB).length;
    const interfered = neurons.filter(n => n.isInterfered).length;
    const preserved = neurons.filter(n => n.isImportantForA && !n.isInterfered).length;
    const avgInterference = neurons.reduce((sum, n) => sum + n.interference, 0) / neurons.length;

    return { importantA, importantB, shared, interfered, preserved, avgInterference };
  }, [neurons]);

  const getNeuronColor = (n: typeof neurons[0]) => {
    if (step === 'initial') {
      return { bg: '#F0EBE1', border: '#E5DFD3' };
    }
    if (step === 'taskA') {
      if (n.taskAImportance > 0.7) return { bg: '#8BA888', border: '#6E8B6B' };
      if (n.taskAImportance > 0.4) return { bg: '#8BA88860', border: '#8BA888' };
      return { bg: '#F0EBE1', border: '#E5DFD3' };
    }
    // step === 'taskB'
    if (n.isInterfered) {
      return { bg: '#C76B4A', border: '#A55A3D' }; // Interfered - damaged
    }
    if (n.isImportantForA && !n.isInterfered) {
      return { bg: '#8BA888', border: '#6E8B6B' }; // Preserved
    }
    if (n.isImportantForB && !n.isImportantForA) {
      return { bg: '#D4A843', border: '#B8922F' }; // New Task B neurons
    }
    if (n.taskBModification > 0.3) {
      return { bg: '#D4A84340', border: '#D4A843' }; // Lightly modified
    }
    return { bg: '#F0EBE1', border: '#E5DFD3' };
  };

  const steps: Array<{ key: typeof step; label: string; desc: string }> = [
    { key: 'initial', label: 'Untrained', desc: 'No task trained yet. All neurons are neutral.' },
    { key: 'taskA', label: 'After Task A', desc: 'Green neurons are important for Task A. Brighter = more critical.' },
    { key: 'taskB', label: 'After Task B', desc: 'Red = Task A neurons damaged by Task B. Gold = new Task B neurons.' },
  ];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Parameter Interference Visualizer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how neurons important for Task A get overwritten when training on Task B. Higher task overlap means more interference.
        </p>
      </div>

      {/* Step selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {steps.map(s => (
          <button key={s.key} onClick={() => setStep(s.key)} style={{
            padding: '0.4rem 0.8rem', borderRadius: '6px',
            border: `1px solid ${step === s.key ? '#8BA888' : '#E5DFD3'}`,
            background: step === s.key ? '#8BA88815' : '#FDFBF7',
            color: step === s.key ? '#3D5240' : '#5A6B5C',
            fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
            transition: 'all 0.15s ease',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Task Overlap</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{overlap}%</span>
        </div>
        <input type="range" min={0} max={100} step={5} value={overlap}
          onChange={e => setOverlap(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', fontSize: '0.6rem', color: '#7A8B7C' }}>
          <span>Orthogonal tasks</span>
          <span>Fully overlapping</span>
        </div>
      </div>

      {/* Neuron grid */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>
          {steps.find(s => s.key === step)?.desc}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: '3px',
          maxWidth: '360px',
          margin: '0 auto',
        }}>
          {neurons.map(n => {
            const colors = getNeuronColor(n);
            return (
              <div key={n.index} style={{
                aspectRatio: '1',
                borderRadius: '4px',
                background: colors.bg,
                border: `1.5px solid ${colors.border}`,
                transition: 'all 0.3s ease',
                minHeight: '20px',
              }} />
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {step === 'taskA' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#5A6B5C' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#8BA888' }} />
                High importance
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#5A6B5C' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#8BA88860', border: '1px solid #8BA888' }} />
                Medium
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#5A6B5C' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#F0EBE1', border: '1px solid #E5DFD3' }} />
                Low importance
              </div>
            </>
          )}
          {step === 'taskB' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#5A6B5C' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#C76B4A' }} />
                Interfered
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#5A6B5C' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#8BA888' }} />
                Preserved
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#5A6B5C' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#D4A843' }} />
                New (Task B)
              </div>
            </>
          )}
          {step === 'initial' && (
            <div style={{ fontSize: '0.68rem', color: '#7A8B7C', fontStyle: 'italic' }}>
              Select a training step above to see neuron importance
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Task A Critical</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{stats.importantA}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Shared</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{stats.shared}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Interfered</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{stats.interfered}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Preserved</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#8BA888' }}>{stats.preserved}</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> {overlap < 25
          ? 'With low task overlap, the tasks use mostly different parameters. Interference is minimal -- the model can learn both tasks without much conflict.'
          : overlap < 60
          ? `Moderate overlap means ${stats.shared} neurons are shared between tasks. When Task B modifies these shared neurons, it damages Task A performance -- this is catastrophic forgetting in action.`
          : `High overlap (${overlap}%) means both tasks compete for the same parameters. ${stats.interfered} of ${stats.importantA} important Task A neurons get interfered with, explaining why catastrophic forgetting is so severe when tasks are related.`}
      </div>
    </div>
  );
}
