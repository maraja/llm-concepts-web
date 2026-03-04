import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

type CurveType = 'parabola' | 'bumpy';

export default function GradientDescentSteps() {
  const [learningRate, setLearningRate] = useState(0.15);
  const [startPos, setStartPos] = useState(4.0);
  const [curve, setCurve] = useState<CurveType>('parabola');
  const numSteps = 20;

  // Loss functions and their derivatives
  const lossFunc = useMemo(() => {
    if (curve === 'parabola') {
      return {
        fn: (x: number) => 0.5 * x * x,
        grad: (x: number) => x,
        name: 'f(x) = 0.5x^2',
      };
    }
    return {
      fn: (x: number) => 0.5 * x * x + 2 * Math.sin(2 * x),
      grad: (x: number) => x + 4 * Math.cos(2 * x),
      name: 'f(x) = 0.5x^2 + 2sin(2x)',
    };
  }, [curve]);

  // Run gradient descent
  const steps = useMemo(() => {
    const positions: { x: number; loss: number; grad: number }[] = [];
    let x = startPos;
    for (let i = 0; i <= numSteps; i++) {
      const loss = lossFunc.fn(x);
      const grad = lossFunc.grad(x);
      positions.push({ x, loss, grad });
      x = x - learningRate * grad;
      // Clamp to prevent extreme values
      x = Math.max(-6, Math.min(6, x));
    }
    return positions;
  }, [learningRate, startPos, lossFunc]);

  // Generate curve points for display
  const curvePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let x = -5; x <= 5; x += 0.1) {
      pts.push({ x, y: lossFunc.fn(x) });
    }
    return pts;
  }, [lossFunc]);

  const minY = Math.min(...curvePoints.map(p => p.y));
  const maxY = Math.max(...curvePoints.map(p => p.y));
  const yRange = maxY - minY || 1;

  const converged = Math.abs(steps[steps.length - 1].x) < 0.1;
  const oscillating = steps.length > 3 && Math.abs(steps[steps.length - 1].loss) > Math.abs(steps[steps.length - 3].loss);
  const diverged = Math.abs(steps[steps.length - 1].x) >= 5.9;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Gradient Descent Steps
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch gradient descent navigate a loss landscape. Increase the learning rate to see overshooting and divergence.
        </p>
      </div>

      {/* Curve selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {([['parabola', 'Simple Parabola'], ['bumpy', 'Bumpy Surface']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setCurve(key)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${curve === key ? '#C76B4A' : '#E5DFD3'}`,
            background: curve === key ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: curve === key ? '#C76B4A' : '#5A6B5C',
            fontWeight: curve === key ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Learning Rate', value: learningRate, set: setLearningRate, min: 0.01, max: 1.5, step: 0.01, fmt: (v: number) => v.toFixed(2) },
          { label: 'Start Position', value: startPos, set: setStartPos, min: -4.5, max: 4.5, step: 0.1, fmt: (v: number) => v.toFixed(1) },
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

      {/* Loss curve with gradient descent path */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          {lossFunc.name}
        </div>
        <div style={{ position: 'relative', height: '180px' }}>
          {/* Curve */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'flex-end' }}>
            {curvePoints.map((pt, i) => {
              const barH = Math.max(((pt.y - minY) / yRange) * 100, 0.5);
              return (
                <div key={i} style={{
                  flex: 1,
                  height: `${barH}%`,
                  background: 'rgba(139, 168, 136, 0.25)',
                  minWidth: '1px',
                }} />
              );
            })}
          </div>
          {/* Gradient descent dots */}
          {steps.slice(0, numSteps + 1).map((step, i) => {
            const xFrac = (step.x + 5) / 10; // map [-5,5] to [0,1]
            if (xFrac < 0 || xFrac > 1) return null;
            const yFrac = Math.min(Math.max(((step.loss - minY) / yRange), 0), 1);
            const isFirst = i === 0;
            const isLast = i === steps.length - 1;
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${xFrac * 100}%`,
                bottom: `${yFrac * 100}%`,
                transform: 'translate(-50%, 50%)',
                width: isFirst || isLast ? '10px' : '6px',
                height: isFirst || isLast ? '10px' : '6px',
                borderRadius: '50%',
                background: isFirst ? '#8BA888' : isLast ? '#C76B4A' : `rgba(199, 107, 74, ${0.3 + (i / steps.length) * 0.5})`,
                border: isFirst || isLast ? '2px solid #FDFBF7' : 'none',
                zIndex: 2,
              }} />
            );
          })}
          {/* Connecting lines between steps */}
          {steps.slice(0, -1).map((step, i) => {
            const next = steps[i + 1];
            const x1 = (step.x + 5) / 10 * 100;
            const x2 = (next.x + 5) / 10 * 100;
            if (x1 < 0 || x1 > 100 || x2 < 0 || x2 > 100) return null;
            return (
              <div key={`line-${i}`} style={{
                position: 'absolute',
                left: `${Math.min(x1, x2)}%`,
                bottom: `${((step.loss - minY) / yRange) * 100}%`,
                width: `${Math.abs(x2 - x1)}%`,
                height: '1px',
                background: 'rgba(199, 107, 74, 0.3)',
                zIndex: 1,
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.3rem' }}>
          <span>x = -5</span>
          <span>x = 0 (minimum)</span>
          <span>x = 5</span>
        </div>
      </div>

      {/* Loss over steps */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Loss over steps
        </div>
        <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '50px' }}>
          {steps.map((step, i) => {
            const maxStepLoss = Math.max(...steps.map(s => Math.abs(s.loss)));
            const barH = maxStepLoss > 0 ? (Math.abs(step.loss) / maxStepLoss) * 100 : 0;
            return (
              <div key={i} style={{
                flex: 1,
                height: `${Math.max(barH, 2)}%`,
                background: i === 0 ? '#8BA888' : i === steps.length - 1 ? '#C76B4A' : '#D4A843',
                borderRadius: '2px 2px 0 0',
                opacity: 0.4 + (i / steps.length) * 0.6,
                minWidth: '2px',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
          <span>Step 0</span>
          <span>Step {numSteps}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'Initial Loss', value: steps[0].loss.toFixed(3), color: '#7A8B7C' },
          { label: 'Final Loss', value: steps[steps.length - 1].loss.toFixed(3), color: '#C76B4A' },
          { label: 'Final Position', value: steps[steps.length - 1].x.toFixed(3), color: '#3D5240' },
          { label: 'Status', value: diverged ? 'Diverged' : oscillating ? 'Oscillating' : converged ? 'Converged' : 'Converging', color: '#D4A843' },
        ].map(s => (
          <div key={s.label} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {diverged
            ? `Learning rate ${learningRate.toFixed(2)} is too high -- the optimizer overshoots the minimum and diverges. Each step moves further from the optimum. In practice, this causes NaN losses and training crashes.`
            : oscillating
            ? `The optimizer is oscillating around the minimum. Learning rate ${learningRate.toFixed(2)} creates steps that are too large for fine convergence. A learning rate schedule that decays over time would help.`
            : converged
            ? `Converged to the minimum in ${numSteps} steps with LR=${learningRate.toFixed(2)}. The step size (LR x gradient) shrinks naturally near the minimum since gradients approach zero.`
            : curve === 'bumpy'
            ? 'The bumpy surface has local minima. Gradient descent may get trapped depending on the starting position and learning rate. This is why optimizers like Adam with momentum help in practice.'
            : `Making progress toward the minimum. With LR=${learningRate.toFixed(2)}, each step moves x by (LR x gradient). Larger LR = bigger steps = faster but riskier convergence.`}
        </div>
      </div>
    </div>
  );
}
