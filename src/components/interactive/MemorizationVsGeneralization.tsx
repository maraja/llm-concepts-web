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

export default function MemorizationVsGeneralization() {
  const [modulus, setModulus] = useState(7);
  const [trainPct, setTrainPct] = useState(60);
  const [trainingEpochs, setTrainingEpochs] = useState(50);

  const grid = useMemo(() => {
    const rng = seededRandom(42);
    const totalCells = modulus * modulus;
    const trainCount = Math.floor(totalCells * trainPct / 100);

    // Generate the true answer grid: (a + b) mod p
    const cells: Array<{ a: number; b: number; answer: number; isTrain: boolean; status: 'correct' | 'memorized' | 'wrong' }> = [];

    // Decide which cells are in training set
    const indices = Array.from({ length: totalCells }, (_, i) => i);
    // Shuffle with seeded random
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const trainSet = new Set(indices.slice(0, trainCount));

    // Model accuracy depends on training epochs and whether cell was in training
    for (let a = 0; a < modulus; a++) {
      for (let b = 0; b < modulus; b++) {
        const idx = a * modulus + b;
        const answer = (a + b) % modulus;
        const isTrain = trainSet.has(idx);

        let status: 'correct' | 'memorized' | 'wrong';
        if (isTrain) {
          // Training examples: memorized quickly
          status = trainingEpochs > 10 ? 'memorized' : 'wrong';
        } else {
          // Test examples: generalization happens later (grokking)
          const grokkingThreshold = 40 + (1 - trainPct / 100) * 60;
          if (trainingEpochs > grokkingThreshold) {
            status = 'correct';
          } else if (trainingEpochs > grokkingThreshold * 0.7) {
            // Partial generalization - some test cells get it right
            status = rng() < (trainingEpochs - grokkingThreshold * 0.7) / (grokkingThreshold * 0.3) ? 'correct' : 'wrong';
          } else {
            status = 'wrong';
          }
        }
        cells.push({ a, b, answer, isTrain, status });
      }
    }
    return cells;
  }, [modulus, trainPct, trainingEpochs]);

  const counts = useMemo(() => {
    const correct = grid.filter(c => c.status === 'correct').length;
    const memorized = grid.filter(c => c.status === 'memorized').length;
    const wrong = grid.filter(c => c.status === 'wrong').length;
    return { correct, memorized, wrong, total: grid.length };
  }, [grid]);

  const testAccuracy = useMemo(() => {
    const testCells = grid.filter(c => !c.isTrain);
    if (testCells.length === 0) return 100;
    const correctTest = testCells.filter(c => c.status === 'correct').length;
    return (correctTest / testCells.length) * 100;
  }, [grid]);

  const statusColor = (s: string) => s === 'correct' ? '#8BA888' : s === 'memorized' ? '#D4A843' : '#C76B4A';
  const statusBg = (s: string) => s === 'correct' ? '#8BA88830' : s === 'memorized' ? '#D4A84330' : '#C76B4A30';

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Memorization vs. Generalization Grid
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          A modular arithmetic task: (a + b) mod p. See which cells the model memorizes vs. truly generalizes to.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Modulus (p)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{modulus}</span>
          </div>
          <input type="range" min={3} max={11} step={1} value={modulus}
            onChange={e => setModulus(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Training Data %</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{trainPct}%</span>
          </div>
          <input type="range" min={10} max={95} step={5} value={trainPct}
            onChange={e => setTrainPct(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #C76B4A, #8BA888)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Training Epochs</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{trainingEpochs}</span>
          </div>
          <input type="range" min={0} max={100} step={1} value={trainingEpochs}
            onChange={e => setTrainingEpochs(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Grid visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>
          (a + b) mod {modulus} -- rows = a, columns = b
        </div>
        <div style={{ display: 'inline-grid', gridTemplateColumns: `30px repeat(${modulus}, 1fr)`, gap: '2px', width: '100%' }}>
          {/* Column headers */}
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }} />
          {Array.from({ length: modulus }, (_, b) => (
            <div key={`h${b}`} style={{ textAlign: 'center', fontSize: '0.65rem', color: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace", padding: '2px 0' }}>
              {b}
            </div>
          ))}

          {/* Grid rows */}
          {Array.from({ length: modulus }, (_, a) => (
            <>
              <div key={`r${a}`} style={{ fontSize: '0.65rem', color: '#7A8B7C', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {a}
              </div>
              {Array.from({ length: modulus }, (__, b) => {
                const cell = grid[a * modulus + b];
                return (
                  <div key={`${a}-${b}`} style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    background: statusBg(cell.status),
                    border: `1.5px solid ${statusColor(cell.status)}`,
                    fontSize: modulus > 8 ? '0.55rem' : '0.7rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: statusColor(cell.status),
                    transition: 'all 0.2s ease',
                    minHeight: '24px',
                  }}>
                    {cell.answer}
                  </div>
                );
              })}
            </>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#5A6B5C' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#8BA88830', border: '1.5px solid #8BA888' }} />
            Generalized
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#5A6B5C' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#D4A84330', border: '1.5px solid #D4A843' }} />
            Memorized
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#5A6B5C' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#C76B4A30', border: '1.5px solid #C76B4A' }} />
            Wrong
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Generalized</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{counts.correct}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Memorized</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{counts.memorized}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Wrong</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{counts.wrong}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Test Acc</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: testAccuracy > 80 ? '#3D5240' : testAccuracy > 40 ? '#D4A843' : '#C76B4A' }}>
            {testAccuracy.toFixed(0)}%
          </div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> {trainingEpochs < 15
          ? 'Early training -- the model has not yet learned much. Both train and test cells are mostly wrong.'
          : testAccuracy < 30
          ? 'The model has memorized the training examples (yellow cells) but fails on held-out test cells (red). This is the "memorization phase" before grokking.'
          : testAccuracy < 80
          ? 'Grokking is beginning! Some test cells are turning green as the model discovers the general rule (a+b) mod p, not just lookup tables.'
          : 'Full generalization achieved! The model has learned the underlying algorithm, correctly predicting even unseen (a, b) pairs.'}
      </div>
    </div>
  );
}
