import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const FUNCTIONS: Record<string, { fn: (x: number) => number; color: string; desc: string }> = {
  ReLU: { fn: x => Math.max(0, x), color: '#C76B4A', desc: 'Simple and fast, but "dead neurons" below zero' },
  GELU: { fn: x => x * 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))), color: '#8BA888', desc: 'Smooth approximation used in GPT-2, BERT — current standard' },
  SiLU: { fn: x => x / (1 + Math.exp(-x)), color: '#D4A843', desc: 'Also called Swish — smooth, non-monotonic for x < 0' },
  Sigmoid: { fn: x => 1 / (1 + Math.exp(-x)), color: '#6E8B6B', desc: 'Classic 0-to-1 squashing — suffers from vanishing gradients' },
  Tanh: { fn: x => Math.tanh(x), color: '#7A8B7C', desc: 'Centered at zero, but still saturates at extremes' },
};

export default function ActivationFunctionGrapher() {
  const [selected, setSelected] = useState<string[]>(['ReLU', 'GELU']);
  const [probeX, setProbeX] = useState(0);

  const range = useMemo(() => {
    const pts: number[] = [];
    for (let x = -4; x <= 4; x += 0.1) pts.push(Math.round(x * 10) / 10);
    return pts;
  }, []);

  const toggle = (name: string) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const width = 400;
  const height = 200;
  const xScale = (x: number) => ((x + 4) / 8) * width;
  const yScale = (y: number) => height - ((y + 2) / 5) * height;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Activation Function Explorer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare activation functions used in transformer FFN layers. Toggle functions and probe values.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {Object.entries(FUNCTIONS).map(([name, { color }]) => (
          <button key={name} onClick={() => toggle(name)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${selected.includes(name) ? color : '#E5DFD3'}`,
            background: selected.includes(name) ? color + '15' : 'transparent',
            color: selected.includes(name) ? color : '#B0A898',
            fontWeight: selected.includes(name) ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {name}
          </button>
        ))}
      </div>

      {/* SVG Graph */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: '450px', display: 'block', margin: '0 auto' }}>
          {/* Grid */}
          <line x1={xScale(0)} y1={0} x2={xScale(0)} y2={height} stroke="#E5DFD3" strokeWidth="1" />
          <line x1={0} y1={yScale(0)} x2={width} y2={yScale(0)} stroke="#E5DFD3" strokeWidth="1" />
          {[-2, -1, 1, 2, 3].map(v => (
            <line key={`h${v}`} x1={0} y1={yScale(v)} x2={width} y2={yScale(v)} stroke="#E5DFD3" strokeWidth="0.5" strokeDasharray="4" />
          ))}

          {/* Function curves */}
          {selected.map(name => {
            const { fn, color } = FUNCTIONS[name];
            const d = range.map((x, i) => {
              const y = Math.max(-2, Math.min(3, fn(x)));
              return `${i === 0 ? 'M' : 'L'}${xScale(x)},${yScale(y)}`;
            }).join(' ');
            return <path key={name} d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
          })}

          {/* Probe line */}
          <line x1={xScale(probeX)} y1={0} x2={xScale(probeX)} y2={height} stroke="#C76B4A" strokeWidth="1" strokeDasharray="3" opacity="0.5" />
          {selected.map(name => {
            const { fn, color } = FUNCTIONS[name];
            const y = fn(probeX);
            return <circle key={name} cx={xScale(probeX)} cy={yScale(Math.max(-2, Math.min(3, y)))} r="4" fill={color} stroke="#FDFBF7" strokeWidth="1.5" />;
          })}
        </svg>
      </div>

      {/* Probe slider */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Probe x</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{probeX.toFixed(1)}</span>
        </div>
        <input type="range" min={-4} max={4} step={0.1} value={probeX}
          onChange={e => setProbeX(parseFloat(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #C76B4A, #E5DFD3, #8BA888)', borderRadius: '3px', cursor: 'pointer' }}
        />
      </div>

      {/* Values */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(selected.length, 3)}, 1fr)`, gap: '0.5rem' }}>
        {selected.map(name => {
          const { fn, color, desc } = FUNCTIONS[name];
          const y = fn(probeX);
          return (
            <div key={name} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color }}>{name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#2C3E2D' }}>{y.toFixed(3)}</div>
              <div style={{ fontSize: '0.62rem', color: '#7A8B7C', marginTop: '0.2rem' }}>{desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
