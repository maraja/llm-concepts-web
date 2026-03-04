import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

type Optimizer = 'sgd' | 'momentum' | 'adam';

export default function AdamMomentumVisualizer() {
  const [lr, setLr] = useState(0.05);
  const [numSteps, setNumSteps] = useState(40);

  // Simulate optimization on a 2D loss surface: f(x,y) = 3x^2 + 0.5y^2 (elongated bowl)
  // This shows how different optimizers handle different curvatures per axis
  const trajectories = useMemo(() => {
    const startX = 4.0;
    const startY = 4.0;

    const run = (opt: Optimizer): { x: number; y: number; loss: number }[] => {
      let x = startX, y = startY;
      let mx = 0, my = 0; // first moment (momentum)
      let vx = 0, vy = 0; // second moment (Adam)
      const beta1 = 0.9, beta2 = 0.999, eps = 1e-8;
      const path: { x: number; y: number; loss: number }[] = [];

      for (let t = 0; t <= numSteps; t++) {
        const loss = 3 * x * x + 0.5 * y * y;
        path.push({ x, y, loss });

        const gx = 6 * x; // df/dx
        const gy = 1 * y; // df/dy

        if (opt === 'sgd') {
          x -= lr * gx;
          y -= lr * gy;
        } else if (opt === 'momentum') {
          mx = 0.9 * mx + gx;
          my = 0.9 * my + gy;
          x -= lr * mx;
          y -= lr * my;
        } else {
          // Adam
          mx = beta1 * mx + (1 - beta1) * gx;
          my = beta1 * my + (1 - beta1) * gy;
          vx = beta2 * vx + (1 - beta2) * gx * gx;
          vy = beta2 * vy + (1 - beta2) * gy * gy;
          const mxHat = mx / (1 - Math.pow(beta1, t + 1));
          const myHat = my / (1 - Math.pow(beta1, t + 1));
          const vxHat = vx / (1 - Math.pow(beta2, t + 1));
          const vyHat = vy / (1 - Math.pow(beta2, t + 1));
          x -= lr * mxHat / (Math.sqrt(vxHat) + eps);
          y -= lr * myHat / (Math.sqrt(vyHat) + eps);
        }
        // Clamp
        x = Math.max(-5, Math.min(5, x));
        y = Math.max(-5, Math.min(5, y));
      }
      return path;
    };

    return {
      sgd: run('sgd'),
      momentum: run('momentum'),
      adam: run('adam'),
    };
  }, [lr, numSteps]);

  const configs: { key: Optimizer; name: string; color: string; desc: string }[] = [
    { key: 'sgd', name: 'SGD', color: '#7A8B7C', desc: 'Vanilla gradient descent' },
    { key: 'momentum', name: 'SGD + Momentum', color: '#D4A843', desc: 'Exponential moving avg of gradients' },
    { key: 'adam', name: 'Adam', color: '#C76B4A', desc: 'Adaptive per-parameter learning rates' },
  ];

  // Find convergence step (when loss < 0.1)
  const convergenceSteps = useMemo(() => {
    return configs.map(c => {
      const path = trajectories[c.key];
      const step = path.findIndex(p => p.loss < 0.1);
      return { name: c.name, step: step === -1 ? numSteps : step, color: c.color };
    });
  }, [trajectories, numSteps]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          SGD vs Momentum vs Adam
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare optimizers on an elongated loss surface (3x{'\u00B2'} + 0.5y{'\u00B2'}). Adam adapts per-parameter learning rates to handle different curvatures.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Learning Rate', value: lr, set: setLr, min: 0.005, max: 0.3, step: 0.005, fmt: (v: number) => v.toFixed(3) },
          { label: 'Steps', value: numSteps, set: setNumSteps, min: 10, max: 100, step: 5, fmt: (v: number) => String(v) },
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

      {/* 2D contour-like visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Optimization paths on 2D loss surface (top-down view)
        </div>
        <div style={{ position: 'relative', width: '100%', paddingBottom: '60%', background: '#FDFBF7', borderRadius: '6px', overflow: 'hidden' }}>
          {/* Contour rings */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map(r => (
            <div key={r} style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: `${r * 80}%`, height: `${r * 50}%`,
              transform: 'translate(-50%, -50%)',
              border: '1px solid rgba(229, 223, 211, 0.8)',
              borderRadius: '50%',
            }} />
          ))}
          {/* Axis lines */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: '#E5DFD3' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#E5DFD3' }} />
          {/* Origin marker */}
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: '#2C3E2D' }} />
          {/* Optimizer paths */}
          {configs.map(c => {
            const path = trajectories[c.key];
            return path.map((pt, i) => {
              if (i >= path.length - 1) return null;
              // Map x,y from [-5,5] to [0,100]%
              const px = ((pt.x + 5) / 10) * 100;
              const py = ((pt.y + 5) / 10) * 100;
              const isLast = i === path.length - 2;
              return (
                <div key={`${c.key}-${i}`} style={{
                  position: 'absolute',
                  left: `${px}%`, top: `${py}%`,
                  transform: 'translate(-50%, -50%)',
                  width: isLast ? '8px' : '4px',
                  height: isLast ? '8px' : '4px',
                  borderRadius: '50%',
                  background: c.color,
                  opacity: 0.3 + (i / path.length) * 0.7,
                  zIndex: c.key === 'adam' ? 3 : c.key === 'momentum' ? 2 : 1,
                  border: isLast ? '2px solid #FDFBF7' : 'none',
                }} />
              );
            });
          })}
          {/* Start marker */}
          <div style={{
            position: 'absolute',
            left: `${(4 + 5) / 10 * 100}%`, top: `${(4 + 5) / 10 * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#2C3E2D', border: '2px solid #FDFBF7', zIndex: 4,
          }} />
          {/* Axis labels */}
          <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: '#7A8B7C' }}>x</div>
          <div style={{ position: 'absolute', left: '50%', bottom: '4px', transform: 'translateX(-50%)', fontSize: '0.6rem', color: '#7A8B7C' }}>y</div>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'center' }}>
          {configs.map(c => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }} />
              <span style={{ fontSize: '0.65rem', color: '#5A6B5C' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loss curves */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Loss over steps
        </div>
        <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '60px' }}>
          {Array.from({ length: numSteps + 1 }, (_, i) => {
            const maxLoss = Math.max(...Object.values(trajectories).flatMap(t => t.map(p => p.loss)));
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'stretch', height: '100%', justifyContent: 'flex-end' }}>
                {configs.map(c => {
                  const loss = trajectories[c.key][i]?.loss ?? 0;
                  const barH = maxLoss > 0 ? (loss / maxLoss) * 100 : 0;
                  return (
                    <div key={c.key} style={{
                      height: `${Math.max(barH / 3, 1)}%`,
                      background: c.color,
                      borderRadius: '1px',
                      opacity: 0.7,
                      minHeight: '1px',
                    }} />
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
          <span>Step 0</span>
          <span>Step {numSteps}</span>
        </div>
      </div>

      {/* Convergence stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {convergenceSteps.map(cs => (
          <div key={cs.name} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{cs.name}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: cs.color }}>
              {cs.step >= numSteps ? `>${numSteps}` : cs.step}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>steps to converge</div>
          </div>
        ))}
      </div>

      {/* Final losses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {configs.map(c => {
          const finalLoss = trajectories[c.key][trajectories[c.key].length - 1].loss;
          return (
            <div key={c.key} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Final Loss</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: c.color }}>
                {finalLoss < 0.001 ? finalLoss.toExponential(1) : finalLoss.toFixed(3)}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{c.name}</div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {lr > 0.15
            ? 'High learning rate causes SGD to oscillate, while Adam\'s per-parameter adaptation keeps it stable. Adam divides each parameter\'s update by the root-mean-square of past gradients, effectively using a smaller LR for high-curvature directions.'
            : 'The elongated bowl (steep in x, flat in y) reveals each optimizer\'s character. SGD takes equal-sized steps in both directions. Momentum accelerates along the gentle y-axis. Adam adapts the effective learning rate per-parameter, taking smaller steps where gradients are large (x) and larger steps where they are small (y).'}
        </div>
      </div>
    </div>
  );
}
