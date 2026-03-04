import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

interface CycleData {
  cycle: number;
  generated: number;
  filtered: number;
  filterRate: number;
  accuracy: number;
  sampleTrace: { question: string; reasoning: string; correct: boolean };
}

const sampleTraces = [
  { question: 'Is 17 prime?', reasoning: 'Check: 17/2=8.5, 17/3=5.67, 17/4=4.25. No divisors found. Yes, 17 is prime.', correct: true },
  { question: 'What is 23 + 48?', reasoning: 'Break down: 23 + 48 = 23 + 47 + 1 = 70 + 1 = 71.', correct: true },
  { question: 'Is 91 prime?', reasoning: '91 = 7 x 13. Not prime.', correct: true },
  { question: 'Solve: 3x + 5 = 20', reasoning: '3x = 20 - 5 = 15. x = 15/3 = 5.', correct: true },
  { question: 'What is sqrt(144)?', reasoning: 'Need n where n*n = 144. Try 12: 12*12 = 144. So sqrt(144) = 12.', correct: true },
  { question: 'Is 2^10 > 1000?', reasoning: '2^10 = 1024. 1024 > 1000. Yes.', correct: true },
  { question: 'GCD(24, 36)?', reasoning: '36 = 1*24 + 12. 24 = 2*12 + 0. GCD = 12.', correct: true },
  { question: 'Sum 1..10?', reasoning: 'Use formula n(n+1)/2 = 10*11/2 = 55.', correct: true },
];

export default function SelfPlayLoopViz() {
  const [currentCycle, setCurrentCycle] = useState(0);
  const [filterThreshold, setFilterThreshold] = useState(70);

  const maxCycles = 8;

  const cycles = useMemo((): CycleData[] => {
    const result: CycleData[] = [];
    let baseAccuracy = 35; // starting model accuracy

    for (let c = 0; c <= maxCycles; c++) {
      const generated = 1000;
      // Accuracy improves each cycle, with diminishing returns
      const accuracy = c === 0 ? baseAccuracy : Math.min(95, baseAccuracy + 55 * (1 - Math.exp(-0.4 * c)));
      // Filter rate depends on threshold and current accuracy
      const filterRate = Math.max(5, Math.min(95, accuracy - (100 - filterThreshold) * 0.3 + 10));
      const filtered = Math.round(generated * filterRate / 100);

      result.push({
        cycle: c,
        generated,
        filtered,
        filterRate,
        accuracy,
        sampleTrace: sampleTraces[c % sampleTraces.length],
      });
    }
    return result;
  }, [filterThreshold]);

  const current = cycles[currentCycle];

  const loopStages = ['Generate', 'Filter', 'Train', 'Evaluate'];
  const [activeStage, setActiveStage] = useState(0);

  const stageDescriptions: Record<number, string> = {
    0: 'The model generates reasoning traces for math problems, attempting to solve them step-by-step.',
    1: `Filter traces by correctness. Only solutions that arrive at the right answer (${current.filterRate.toFixed(0)}% pass) are kept for training.`,
    2: 'Fine-tune the model on the filtered correct traces, teaching it the successful reasoning patterns.',
    3: `Evaluate: accuracy is now ${current.accuracy.toFixed(1)}%. The improved model generates better traces in the next cycle.`,
  };

  const chartWidth = 460;
  const chartHeight = 120;
  const padLeft = 40;
  const padBottom = 25;
  const padTop = 10;
  const padRight = 10;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const toX = (c: number) => padLeft + (c / maxCycles) * plotW;
  const toY = (acc: number) => padTop + plotH - ((acc - 20) / 80) * plotH;

  const accPath = cycles
    .filter(c => c.cycle <= currentCycle)
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${toX(c.cycle).toFixed(1)} ${toY(c.accuracy).toFixed(1)}`)
    .join(' ');

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          STaR Self-Improvement Loop
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Step through the Self-Taught Reasoner loop: generate reasoning traces, filter correct ones, retrain, and repeat.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Iteration</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>Cycle {currentCycle}</span>
          </div>
          <input type="range" min={0} max={maxCycles} step={1} value={currentCycle}
            onChange={e => setCurrentCycle(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Filter Threshold</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{filterThreshold}%</span>
          </div>
          <input type="range" min={30} max={95} step={5} value={filterThreshold}
            onChange={e => setFilterThreshold(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #C76B4A, #8BA888)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Loop diagram */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem' }}>STaR Loop -- Click a stage to learn more</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
          {loopStages.map((stage, i) => (
            <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button onClick={() => setActiveStage(i)} style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: `1.5px solid ${activeStage === i ? '#C76B4A' : '#E5DFD3'}`,
                background: activeStage === i ? '#C76B4A12' : '#FDFBF7',
                color: activeStage === i ? '#C76B4A' : '#5A6B5C',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontFamily: "'Source Sans 3', system-ui, sans-serif",
                transition: 'all 0.15s ease',
              }}>
                {stage}
              </button>
              {i < loopStages.length - 1 && (
                <span style={{ color: '#7A8B7C', fontSize: '0.9rem', fontWeight: 300 }}>
                  {'\u2192'}
                </span>
              )}
            </div>
          ))}
          <span style={{ color: '#7A8B7C', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
            {'\u21BA'}
          </span>
        </div>
        <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: '#FDFBF7', borderRadius: '6px', fontSize: '0.75rem', color: '#5A6B5C', textAlign: 'center' }}>
          {stageDescriptions[activeStage]}
        </div>
      </div>

      {/* Sample trace */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Sample reasoning trace (Cycle {currentCycle})</div>
        <div style={{ background: '#FDFBF7', borderRadius: '6px', padding: '0.75rem', border: '1px solid #E5DFD3' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D', marginBottom: '0.3rem' }}>
            Q: {current.sampleTrace.question}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#5A6B5C', lineHeight: 1.6, marginBottom: '0.3rem' }}>
            {current.sampleTrace.reasoning}
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: current.sampleTrace.correct ? '#3D5240' : '#C76B4A' }}>
            {current.sampleTrace.correct ? 'Correct -- kept for training' : 'Incorrect -- filtered out'}
          </div>
        </div>
      </div>

      {/* Accuracy chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Accuracy over self-improvement cycles</div>
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ display: 'block' }}>
          {[30, 50, 70, 90].map(v => (
            <g key={v}>
              <line x1={padLeft} y1={toY(v)} x2={chartWidth - padRight} y2={toY(v)} stroke="#E5DFD3" strokeWidth={1} />
              <text x={padLeft - 5} y={toY(v) + 3} textAnchor="end" fontSize={8} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace">{v}%</text>
            </g>
          ))}
          {Array.from({ length: maxCycles + 1 }, (_, i) => (
            <text key={i} x={toX(i)} y={chartHeight - 3} textAnchor="middle" fontSize={8} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace">{i}</text>
          ))}

          {accPath && <path d={accPath} fill="none" stroke="#8BA888" strokeWidth={2.5} strokeLinecap="round" />}

          {/* Data points */}
          {cycles.filter(c => c.cycle <= currentCycle).map(c => (
            <circle key={c.cycle} cx={toX(c.cycle)} cy={toY(c.accuracy)} r={c.cycle === currentCycle ? 5 : 3} fill={c.cycle === currentCycle ? '#C76B4A' : '#8BA888'} stroke="#FDFBF7" strokeWidth={1.5} />
          ))}
        </svg>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Accuracy</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: current.accuracy > 70 ? '#3D5240' : current.accuracy > 50 ? '#D4A843' : '#C76B4A' }}>
            {current.accuracy.toFixed(1)}%
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Generated</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#2C3E2D' }}>{current.generated}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Pass Filter</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{current.filtered}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Filter Rate</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#8BA888' }}>{current.filterRate.toFixed(0)}%</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> {currentCycle === 0
          ? 'Starting point: the base model has limited reasoning ability. STaR will bootstrap improved reasoning by generating and filtering its own training data.'
          : currentCycle <= 3
          ? 'Early cycles show rapid improvement. The model learns from its own correct solutions, discovering reasoning patterns it could not produce reliably before.'
          : currentCycle <= 6
          ? 'Improvement is continuing but with diminishing returns. The "easy wins" in reasoning have been captured; remaining gains require discovering more complex strategies.'
          : 'Near convergence. The model has extracted most learnable reasoning patterns from self-play. Further improvement may require external data or architectural changes.'}
      </div>
    </div>
  );
}
