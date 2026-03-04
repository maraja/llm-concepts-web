import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const METHODS = [
  { name: 'Sinusoidal', color: '#8BA888' },
  { name: 'Learned', color: '#D4A843' },
  { name: 'RoPE', color: '#C76B4A' },
  { name: 'ALiBi', color: '#3D5240' },
];

export default function ALiBiExtrapolationDemo() {
  const [trainLen, setTrainLen] = useState(2048);

  // Simulated quality scores (0-100) at different inference lengths
  const testLengths = [512, 1024, 2048, 4096, 8192, 16384];

  const getQuality = (method: string, testLen: number): number => {
    const ratio = testLen / trainLen;
    if (ratio <= 1) return 95 + Math.random() * 5; // All good within training

    const excess = ratio - 1;
    switch (method) {
      case 'Sinusoidal': return Math.max(5, 95 - excess * 80);
      case 'Learned': return Math.max(5, 95 - excess * 85);
      case 'RoPE': return Math.max(15, 95 - excess * 40);
      case 'ALiBi': return Math.max(30, 95 - excess * 12);
      default: return 50;
    }
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Length Extrapolation
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          What happens when you test a model on sequences longer than it was trained on? ALiBi degrades gracefully.
        </p>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Training length</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{trainLen.toLocaleString()}</span>
        </div>
        <input type="range" min={512} max={8192} step={512} value={trainLen}
          onChange={e => setTrainLen(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem', fontWeight: 600 }}>
          Quality at inference lengths (trained at {trainLen.toLocaleString()})
        </div>

        {METHODS.map(method => (
          <div key={method.name} style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ width: '65px', fontSize: '0.7rem', fontWeight: 600, color: method.color }}>{method.name}</span>
              <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                {testLengths.map(len => {
                  const q = getQuality(method.name, len);
                  const isExtrapolation = len > trainLen;
                  return (
                    <div key={len} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        height: '20px', borderRadius: '3px', overflow: 'hidden',
                        background: '#E5DFD3',
                        border: isExtrapolation ? '1px dashed #C76B4A30' : '1px solid transparent',
                      }}>
                        <div style={{
                          height: '100%', width: `${q}%`,
                          background: q > 70 ? method.color : q > 40 ? '#D4A843' : '#C76B4A',
                          borderRadius: '3px', transition: 'all 0.3s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '3px', marginLeft: '75px' }}>
          {testLengths.map(len => (
            <div key={len} style={{ flex: 1, textAlign: 'center', fontSize: '0.5rem', color: len > trainLen ? '#C76B4A' : '#7A8B7C', fontWeight: len > trainLen ? 600 : 400 }}>
              {len >= 1024 ? `${len / 1024}K` : len}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem', color: '#7A8B7C' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ width: '16px', height: '8px', borderRadius: '2px', background: '#8BA888' }} /> Within training
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ width: '16px', height: '8px', borderRadius: '2px', border: '1px dashed #C76B4A30', background: '#FDFBF7' }} /> Extrapolation
        </span>
      </div>
    </div>
  );
}
