import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const INPUT_FEATURES = ['syntax', 'semantics', 'position', 'frequency'];

export default function FFNNeuronActivation() {
  const [inputWeights, setInputWeights] = useState([0.8, 0.3, 0.1, -0.2]);
  const [activationFn, setActivationFn] = useState<'relu' | 'gelu' | 'swiglu'>('gelu');

  const preActivation = useMemo(() =>
    inputWeights.reduce((sum, w) => sum + w, 0),
  [inputWeights]);

  const activated = useMemo(() => {
    const x = preActivation;
    if (activationFn === 'relu') return Math.max(0, x);
    if (activationFn === 'gelu') return x * 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)));
    // swiglu approximation
    const sigmoid = 1 / (1 + Math.exp(-x));
    return x * sigmoid;
  }, [preActivation, activationFn]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          FFN Neuron Activation
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Adjust input feature weights to see how a single FFN neuron computes its activation.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {(['relu', 'gelu', 'swiglu'] as const).map(fn => (
          <button key={fn} onClick={() => setActivationFn(fn)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${activationFn === fn ? '#C76B4A' : '#E5DFD3'}`,
            background: activationFn === fn ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: activationFn === fn ? '#C76B4A' : '#5A6B5C',
            fontWeight: activationFn === fn ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {fn.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        {INPUT_FEATURES.map((feat, i) => (
          <div key={feat} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#5A6B5C' }}>{feat}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: inputWeights[i] >= 0 ? '#3D5240' : '#C76B4A', fontWeight: 600 }}>
                {inputWeights[i] > 0 ? '+' : ''}{inputWeights[i].toFixed(1)}
              </span>
            </div>
            <input type="range" min={-1} max={1} step={0.1} value={inputWeights[i]}
              onChange={e => {
                const next = [...inputWeights];
                next[i] = parseFloat(e.target.value);
                setInputWeights(next);
              }}
              style={{ width: '100%', height: '4px', appearance: 'none', WebkitAppearance: 'none', background: '#E5DFD3', borderRadius: '2px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Pre-activation</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', fontWeight: 600, color: preActivation >= 0 ? '#2C3E2D' : '#C76B4A' }}>
            {preActivation >= 0 ? '+' : ''}{preActivation.toFixed(2)}
          </div>
        </div>
        <div style={{ fontSize: '1.2rem', color: '#D4A843' }}>→</div>
        <div style={{ padding: '0.75rem', background: activated > 0 ? '#8BA88815' : '#F0EBE1', borderRadius: '8px', textAlign: 'center', border: activated > 0 ? '1px solid #8BA88830' : '1px solid transparent' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{activationFn.toUpperCase()} Output</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', fontWeight: 600, color: activated > 0 ? '#3D5240' : '#B0A898' }}>
            {activated.toFixed(3)}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
            {activated > 0.5 ? 'Strong activation' : activated > 0 ? 'Weak activation' : 'Suppressed'}
          </div>
        </div>
      </div>
    </div>
  );
}
