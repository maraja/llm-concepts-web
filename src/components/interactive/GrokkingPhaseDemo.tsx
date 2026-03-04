import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

function sigmoid(x: number, center: number, steepness: number): number {
  return 1 / (1 + Math.exp(-steepness * (x - center)));
}

export default function GrokkingPhaseDemo() {
  const [trainingStep, setTrainingStep] = useState(50);
  const [weightDecay, setWeightDecay] = useState(0.5);

  const totalSteps = 200;
  const points = useMemo(() => {
    const grokkingDelay = 120 - weightDecay * 80;
    const result = [];
    for (let step = 0; step <= totalSteps; step += 2) {
      const trainAcc = sigmoid(step, 15, 0.3) * 100;
      const testAcc = sigmoid(step, grokkingDelay, 0.12 + weightDecay * 0.08) * 100;
      result.push({ step, trainAcc: Math.min(trainAcc, 99.8), testAcc: Math.min(testAcc, 99.5) });
    }
    return result;
  }, [weightDecay]);

  const currentPoint = useMemo(() => {
    const idx = Math.min(Math.floor(trainingStep / 2), points.length - 1);
    return points[idx];
  }, [trainingStep, points]);

  const grokkingDelay = 120 - weightDecay * 80;
  const phase = trainingStep < 25 ? 'Fitting' : trainingStep < grokkingDelay - 10 ? 'Memorization' : trainingStep < grokkingDelay + 20 ? 'Grokking!' : 'Generalized';
  const phaseColor = phase === 'Fitting' ? '#7A8B7C' : phase === 'Memorization' ? '#D4A843' : phase === 'Grokking!' ? '#C76B4A' : '#3D5240';

  const chartWidth = 500;
  const chartHeight = 160;
  const padLeft = 40;
  const padBottom = 25;
  const padTop = 10;
  const padRight = 10;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const toX = (step: number) => padLeft + (step / totalSteps) * plotW;
  const toY = (acc: number) => padTop + plotH - (acc / 100) * plotH;

  const trainPath = useMemo(() => {
    return points
      .filter(p => p.step <= trainingStep)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.step).toFixed(1)} ${toY(p.trainAcc).toFixed(1)}`)
      .join(' ');
  }, [trainingStep, points]);

  const testPath = useMemo(() => {
    return points
      .filter(p => p.step <= trainingStep)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.step).toFixed(1)} ${toY(p.testAcc).toFixed(1)}`)
      .join(' ');
  }, [trainingStep, points]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Grokking Phase Transition
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch the delayed generalization phenomenon: training accuracy jumps early, but test accuracy suddenly "groks" much later.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Training Step</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{trainingStep}</span>
          </div>
          <input type="range" min={0} max={totalSteps} step={2} value={trainingStep}
            onChange={e => setTrainingStep(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Weight Decay Strength</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{weightDecay.toFixed(2)}</span>
          </div>
          <input type="range" min={0.05} max={1.0} step={0.05} value={weightDecay}
            onChange={e => setWeightDecay(parseFloat(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #D4A843, #8BA888)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ display: 'block' }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(v => (
            <g key={v}>
              <line x1={padLeft} y1={toY(v)} x2={chartWidth - padRight} y2={toY(v)} stroke="#E5DFD3" strokeWidth={1} />
              <text x={padLeft - 5} y={toY(v) + 3} textAnchor="end" fontSize={9} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace">{v}%</text>
            </g>
          ))}
          {/* X-axis labels */}
          {[0, 50, 100, 150, 200].map(s => (
            <text key={s} x={toX(s)} y={chartHeight - 3} textAnchor="middle" fontSize={9} fill="#7A8B7C" fontFamily="'JetBrains Mono', monospace">{s}</text>
          ))}

          {/* Grokking region */}
          {trainingStep >= grokkingDelay - 10 && (
            <rect x={toX(grokkingDelay - 10)} y={padTop} width={toX(grokkingDelay + 20) - toX(grokkingDelay - 10)} height={plotH} fill="#C76B4A" opacity={0.06} rx={4} />
          )}

          {/* Train accuracy line */}
          {trainPath && <path d={trainPath} fill="none" stroke="#D4A843" strokeWidth={2.5} strokeLinecap="round" />}
          {/* Test accuracy line */}
          {testPath && <path d={testPath} fill="none" stroke="#8BA888" strokeWidth={2.5} strokeLinecap="round" />}

          {/* Current position markers */}
          <circle cx={toX(currentPoint.step)} cy={toY(currentPoint.trainAcc)} r={4} fill="#D4A843" stroke="#FDFBF7" strokeWidth={1.5} />
          <circle cx={toX(currentPoint.step)} cy={toY(currentPoint.testAcc)} r={4} fill="#8BA888" stroke="#FDFBF7" strokeWidth={1.5} />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#5A6B5C' }}>
            <div style={{ width: 14, height: 3, background: '#D4A843', borderRadius: 2 }} />
            Train Accuracy
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#5A6B5C' }}>
            <div style={{ width: 14, height: 3, background: '#8BA888', borderRadius: 2 }} />
            Test Accuracy
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Phase</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: phaseColor }}>{phase}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Train Acc</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#D4A843' }}>{currentPoint.trainAcc.toFixed(1)}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Test Acc</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#8BA888' }}>{currentPoint.testAcc.toFixed(1)}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Gap</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{(currentPoint.trainAcc - currentPoint.testAcc).toFixed(1)}%</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> {weightDecay < 0.3
          ? 'Low weight decay delays grokking significantly. Without regularization, the model may memorize forever and never generalize on small datasets.'
          : weightDecay < 0.7
          ? 'Moderate weight decay accelerates the phase transition. The model is pushed toward simpler solutions that generalize.'
          : 'Strong weight decay forces early generalization. The grokking transition happens faster because the model cannot maintain complex memorization circuits.'}
      </div>
    </div>
  );
}
