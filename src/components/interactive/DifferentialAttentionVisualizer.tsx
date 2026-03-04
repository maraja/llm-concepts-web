import { useState, useMemo } from 'react';

const TOKENS = ['The', 'cat', 'sat', 'on', 'mat'];

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function DifferentialAttentionVisualizer() {
  const [lambda, setLambda] = useState(0.5);

  // Simulated attention maps for two sub-heads
  const attn1 = [0.35, 0.25, 0.15, 0.10, 0.15];
  const attn2 = [0.10, 0.20, 0.15, 0.10, 0.45];

  const diffAttn = useMemo(() => {
    const raw = attn1.map((a, i) => a - lambda * attn2[i]);
    const positive = raw.map(v => Math.max(v, 0));
    const sum = positive.reduce((a, b) => a + b, 0) || 1;
    return positive.map(v => v / sum);
  }, [lambda]);

  const maxDiff = Math.max(...diffAttn);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Differential Attention
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Differential attention subtracts two attention maps to cancel noise. Adjust lambda (λ) to control the subtraction strength.
        </p>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>Lambda (λ)</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>{lambda.toFixed(2)}</span>
        </div>
        <input type="range" min={0} max={1} step={0.05} value={lambda}
          onChange={e => setLambda(parseFloat(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'start', marginBottom: '1rem' }}>
        {/* Attn Map 1 */}
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#8BA888', marginBottom: '0.5rem' }}>Attention Map 1</div>
          {TOKENS.map((tok, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", width: '28px', color: '#5A6B5C' }}>{tok}</span>
              <div style={{ flex: 1, height: '14px', background: '#E5DFD3', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${attn1[i] * 100 / 0.45}%`, background: '#8BA888', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono', monospace", color: '#7A8B7C', width: '28px' }}>{(attn1[i] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem', fontSize: '1.2rem', color: '#C76B4A', fontWeight: 700 }}>
          <span>−</span>
          <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#7A8B7C' }}>λ={lambda.toFixed(2)}</span>
        </div>

        {/* Attn Map 2 */}
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#D4A843', marginBottom: '0.5rem' }}>Attention Map 2</div>
          {TOKENS.map((tok, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", width: '28px', color: '#5A6B5C' }}>{tok}</span>
              <div style={{ flex: 1, height: '14px', background: '#E5DFD3', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${attn2[i] * 100 / 0.45}%`, background: '#D4A843', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono', monospace", color: '#7A8B7C', width: '28px' }}>{(attn2[i] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div style={{ background: '#3D524008', borderRadius: '8px', padding: '0.75rem', border: '1px solid #8BA88830' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3D5240', marginBottom: '0.5rem' }}>Differential Result (noise cancelled)</div>
        {TOKENS.map((tok, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '35px 1fr 40px', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: diffAttn[i] === maxDiff ? '#C76B4A' : '#5A6B5C', fontWeight: diffAttn[i] === maxDiff ? 600 : 400, textAlign: 'right' }}>{tok}</span>
            <div style={{ height: '18px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(diffAttn[i] / maxDiff) * 100}%`, background: diffAttn[i] === maxDiff ? 'linear-gradient(90deg, #C76B4A, #D4896D)' : '#8BA888', borderRadius: '3px', transition: 'width 0.2s ease' }} />
            </div>
            <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#7A8B7C', textAlign: 'right' }}>{(diffAttn[i] * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
